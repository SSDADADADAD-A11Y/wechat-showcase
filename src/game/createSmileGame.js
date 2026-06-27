export const SMILE_HEADS = [
  ['慈祥笑', '/game/heads/head-01-cixiang.png'],
  ['欣慰笑', '/game/heads/head-02-xinwei.png'],
  ['会心笑', '/game/heads/head-03-huixin.png'],
  ['鼓励笑', '/game/heads/head-04-guli.png'],
  ['治愈笑', '/game/heads/head-05-zhiyu.png'],
  ['释怀笑', '/game/heads/head-06-shihuai.png'],
  ['安心笑', '/game/heads/head-07-anxin.png'],
  ['开怀笑', '/game/heads/head-08-kaihuai.png'],
  ['慈祥笑', '/game/heads/head-09-cixiang-alt.png'],
  ['欣慰笑', '/game/heads/head-10-xinwei-alt.png'],
  ['会心笑', '/game/heads/head-11-huixin-alt.png'],
  ['鼓励笑', '/game/heads/head-12-guli-alt.png'],
  ['治愈笑', '/game/heads/head-13-zhiyu-alt.png'],
  ['释怀笑', '/game/heads/head-14-shihuai-alt.png'],
  ['安心笑', '/game/heads/head-15-anxin-alt.png'],
  ['开怀笑', '/game/heads/head-16-kaihuai-alt.png'],
  ['看破笑', '/game/heads/head-17-kanpo.png'],
  ['敷衍笑', '/game/heads/head-18-fuyan.png'],
  ['尴尬笑', '/game/heads/head-19-ganga.png'],
  ['苦笑', '/game/heads/head-20-kuxiao.png'],
  ['冷笑', '/game/heads/head-21-lengxiao.png'],
  ['忍住笑', '/game/heads/head-22-renzhu.png'],
  ['偷笑', '/game/heads/head-23-touxiao.png'],
  ['释然笑', '/game/heads/head-24-shiran.png'],
];

const GESTURE_LABELS = {
  Closed_Fist: '握拳',
  Open_Palm: '张掌',
  None: '等待手势',
};

export function getSmilePerformanceProfile() {
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const compactTouchDevice =
    navigator.maxTouchPoints > 0 && Math.min(window.screen.width, window.screen.height) <= 900;

  if (mobileUserAgent || compactTouchDevice) {
    return {
      id: 'light',
      label: '手机轻量模式',
      cameraWidth: 640,
      cameraHeight: 480,
      cameraFrameRate: 24,
      inferenceInterval: 110,
      numHands: 1,
      maxDpr: 1,
      dissolveParticles: 40,
      switchParticles: 16,
    };
  }

  return {
    id: 'standard',
    label: '桌面流畅模式',
    cameraWidth: 960,
    cameraHeight: 540,
    cameraFrameRate: 30,
    inferenceInterval: 66,
    numHands: 1,
    maxDpr: 1.5,
    dissolveParticles: 88,
    switchParticles: 28,
  };
}

export function createSmileGame({
  video,
  canvas,
  getThreshold,
  onStatus,
  onState,
  onReadout,
  onHeadChange,
}) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const performanceProfile = getSmilePerformanceProfile();
  const headImages = SMILE_HEADS.map(([, src]) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    return image;
  });

  let stream = null;
  let visionWorker = null;
  let workerReadyPromise = null;
  let workerReadyResolve = null;
  let workerReadyReject = null;
  let workerInitTimeout = 0;
  let inferencePending = false;
  let inferenceRequestId = 0;
  let visionGeneration = 0;
  let consecutiveDetectionErrors = 0;
  let animationFrame = 0;
  let lastVideoTime = -1;
  let lastInferenceAt = 0;
  let lastReadoutAt = 0;
  let running = false;
  let destroyed = false;

  let faceAnchor = null;
  let overlayStrength = 0;
  let lastOverlayWasActive = false;
  let currentHeadIndex = 0;
  let switchFlash = 0;
  let nodBaselineY = null;
  let nodBaselinePitch = null;
  let nodSignal = 0;
  let nodArmed = true;
  let lastSwitchAt = 0;
  let fistFrames = 0;
  let openFrames = 0;
  let bestGesture = { name: 'None', score: 0 };
  const particles = [];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
    if (!running) paintIdleScene();
  });
  resizeObserver.observe(canvas);

  for (const image of headImages) {
    image.addEventListener('load', () => {
      if (!running && !destroyed) paintIdleScene();
    });
  }

  requestAnimationFrame(() => {
    if (!destroyed) {
      paintIdleScene();
      emitReadout(performance.now(), true);
    }
  });

  async function start() {
    if (running || destroyed) return;

    onState({ loading: true, running: false, modeLabel: performanceProfile.label });
    onStatus('准备摄像头');

    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('请使用 HTTPS 地址打开后再启动摄像头');
      }
      if (!window.Worker || typeof window.createImageBitmap !== 'function') {
        throw new Error('当前浏览器不支持高速识别，请使用最新版系统浏览器');
      }

      const cameraPromise = navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: performanceProfile.cameraWidth },
          height: { ideal: performanceProfile.cameraHeight },
          frameRate: { ideal: performanceProfile.cameraFrameRate, max: performanceProfile.cameraFrameRate },
          facingMode: 'user',
        },
        audio: false,
      });

      onStatus(`加载识别模型 · ${performanceProfile.label}`);
      const [mediaStream] = await Promise.all([cameraPromise, initializeVisionWorker()]);
      if (destroyed) {
        mediaStream.getTracks().forEach((track) => track.stop());
        return;
      }

      stream = mediaStream;
      video.srcObject = stream;
      await video.play();
      running = true;
      visionGeneration += 1;
      inferencePending = false;
      lastVideoTime = -1;
      lastInferenceAt = 0;
      onState({ loading: false, running: true, modeLabel: performanceProfile.label });
      onStatus(`镜头已连接 · ${performanceProfile.label}`);
      resizeCanvas();
      render();
    } catch (error) {
      console.error(error);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      stream = null;
      video.srcObject = null;
      onState({ loading: false, running: false, modeLabel: performanceProfile.label });
      onStatus(getFriendlyError(error));
      paintIdleScene();
    }
  }

  async function initializeVisionWorker() {
    if (workerReadyPromise) return workerReadyPromise;

    visionWorker = new Worker(new URL('./smileVision.worker.js', import.meta.url), {
      type: 'module',
      name: 'smile-vision-worker',
    });

    visionWorker.addEventListener('message', handleWorkerMessage);
    visionWorker.addEventListener('error', handleWorkerError);
    workerReadyPromise = new Promise((resolve, reject) => {
      workerReadyResolve = resolve;
      workerReadyReject = reject;
      workerInitTimeout = window.setTimeout(() => {
        rejectWorkerInitialization(new Error('识别模型加载超时，请检查网络后重试'));
      }, 45000);
    });

    visionWorker.postMessage({ type: 'init', numHands: performanceProfile.numHands });

    try {
      await workerReadyPromise;
    } catch (error) {
      resetVisionWorker();
      throw error;
    }
  }

  function handleWorkerMessage(event) {
    const message = event.data;

    if (message.type === 'ready') {
      window.clearTimeout(workerInitTimeout);
      workerReadyResolve?.();
      workerReadyResolve = null;
      workerReadyReject = null;
      return;
    }

    if (message.type === 'result') {
      inferencePending = false;
      consecutiveDetectionErrors = 0;
      if (running && message.generation === visionGeneration) applyVisionResults(message);
      return;
    }

    if (message.type === 'detect-error') {
      inferencePending = false;
      consecutiveDetectionErrors += 1;
      console.warn('Worker frame detection failed.', message.message);
      if (consecutiveDetectionErrors >= 3) onStatus('识别暂时中断，正在重试');
      return;
    }

    if (message.type === 'error') {
      const error = new Error(message.message || '识别模型加载失败');
      if (workerReadyReject) rejectWorkerInitialization(error);
      else onStatus(getFriendlyError(error));
    }
  }

  function handleWorkerError(event) {
    const error = new Error(event.message || '识别线程启动失败');
    if (workerReadyReject) rejectWorkerInitialization(error);
    else {
      inferencePending = false;
      onStatus(getFriendlyError(error));
    }
  }

  function rejectWorkerInitialization(error) {
    window.clearTimeout(workerInitTimeout);
    workerReadyReject?.(error);
    workerReadyResolve = null;
    workerReadyReject = null;
  }

  function resetVisionWorker() {
    window.clearTimeout(workerInitTimeout);
    visionWorker?.terminate();
    visionWorker = null;
    workerReadyPromise = null;
    workerReadyResolve = null;
    workerReadyReject = null;
    inferencePending = false;
  }

  function stop() {
    running = false;
    visionGeneration += 1;
    inferencePending = false;
    cancelAnimationFrame(animationFrame);
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    video.pause();
    video.srcObject = null;
    resetTrackingState();
    particles.length = 0;
    onState({ loading: false, running: false, modeLabel: performanceProfile.label });
    onStatus('已停止');
    paintIdleScene();
    emitReadout(performance.now(), true);
  }

  function destroy() {
    destroyed = true;
    running = false;
    visionGeneration += 1;
    inferencePending = false;
    cancelAnimationFrame(animationFrame);
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    video.pause();
    video.srcObject = null;
    particles.length = 0;
    resizeObserver.disconnect();
    if (visionWorker) {
      visionWorker.postMessage({ type: 'dispose' });
      visionWorker.terminate();
      visionWorker = null;
    }
    window.clearTimeout(workerInitTimeout);
  }

  function render(now = performance.now()) {
    if (!running || destroyed) return;

    resizeCanvas();
    drawCamera();

    const shouldInfer =
      video.currentTime !== lastVideoTime &&
      !inferencePending &&
      now - lastInferenceAt > performanceProfile.inferenceInterval;
    if (shouldInfer && visionWorker) {
      requestVisionFrame(now);
      lastVideoTime = video.currentTime;
      lastInferenceAt = now;
    }

    const overlayIsActive = Boolean(faceAnchor && fistFrames >= 2);
    const targetStrength = overlayIsActive ? 1 : 0;
    overlayStrength += (targetStrength - overlayStrength) * (overlayIsActive ? 0.18 : 0.34);

    if (overlayIsActive) updateNodTrigger(faceAnchor, now);
    else resetMotionState();

    if (!overlayIsActive && lastOverlayWasActive && faceAnchor) {
      spawnHeadDissolve(
        faceAnchor,
        prefersReducedMotion ? 24 : performanceProfile.dissolveParticles,
      );
    }
    lastOverlayWasActive = overlayIsActive;

    if (overlayStrength > 0.01 && faceAnchor) {
      drawSmileHead(faceAnchor, overlayStrength);
      drawFaceHalo(faceAnchor, overlayStrength);
    }

    switchFlash = Math.max(0, switchFlash - 0.045);
    updateAndDrawParticles(now);
    emitReadout(now);
    animationFrame = requestAnimationFrame(render);
  }

  async function requestVisionFrame(timestampMs) {
    inferencePending = true;
    const requestId = ++inferenceRequestId;
    const generation = visionGeneration;

    try {
      const bitmap = await window.createImageBitmap(video);
      if (!running || destroyed || generation !== visionGeneration) {
        bitmap.close?.();
        inferencePending = false;
        return;
      }

      visionWorker.postMessage(
        { type: 'detect', bitmap, timestampMs, requestId, generation },
        [bitmap],
      );
    } catch (error) {
      inferencePending = false;
      consecutiveDetectionErrors += 1;
      console.warn('Unable to prepare camera frame for worker.', error);
      if (consecutiveDetectionErrors >= 3) onStatus(getFriendlyError(error));
    }
  }

  function applyVisionResults(message) {
    const faceResult = { faceLandmarks: message.faceLandmarks };
    const nextAnchor = getFaceAnchor(faceResult);
    faceAnchor = nextAnchor ? smoothAnchor(faceAnchor, nextAnchor, 0.26) : null;

    const gestureResult = {
      gestures: message.gestures,
      landmarks: message.handLandmarks,
    };
    const gestureSignal = getGestureSignal(gestureResult);
    bestGesture = gestureSignal.best;

    if (gestureSignal.isFist) {
      fistFrames = Math.min(fistFrames + 1, 8);
      openFrames = 0;
    } else {
      openFrames = Math.min(openFrames + 1, 8);
      if (openFrames >= 3 || gestureSignal.isOpen) fistFrames = 0;
    }
  }

  function updateNodTrigger(anchor, now) {
    const threshold = Number(getThreshold());
    if (nodBaselineY === null || nodBaselinePitch === null) {
      nodBaselineY = anchor.y;
      nodBaselinePitch = anchor.pitch;
      nodSignal = 0;
      nodArmed = true;
      return;
    }

    const centerDrop = Math.max(0, (anchor.y - nodBaselineY) / Math.max(1, anchor.height));
    const pitchChange = Math.abs(anchor.pitch - nodBaselinePitch);
    const rawSignal = Math.max(centerDrop, pitchChange * 0.9);
    nodSignal = lerp(nodSignal, rawSignal, 0.44);

    if (nodArmed && nodSignal > threshold && now - lastSwitchAt > 560) {
      switchHead(anchor, now);
      nodArmed = false;
      return;
    }

    if (nodSignal < threshold * 0.42) {
      nodArmed = true;
      nodBaselineY = lerp(nodBaselineY, anchor.y, 0.12);
      nodBaselinePitch = lerp(nodBaselinePitch, anchor.pitch, 0.12);
    } else {
      nodBaselineY = lerp(nodBaselineY, anchor.y, 0.012);
      nodBaselinePitch = lerp(nodBaselinePitch, anchor.pitch, 0.012);
    }
  }

  function switchHead(anchor = faceAnchor || getDemoAnchor(), now = performance.now()) {
    currentHeadIndex = (currentHeadIndex + 1) % SMILE_HEADS.length;
    switchFlash = 1;
    lastSwitchAt = now;
    onHeadChange({ index: currentHeadIndex, name: SMILE_HEADS[currentHeadIndex][0] });
    onStatus(`已切换 · ${SMILE_HEADS[currentHeadIndex][0]}`);
    spawnBurst(anchor, prefersReducedMotion ? 8 : performanceProfile.switchParticles);
    emitReadout(now, true);
  }

  function resetTrackingState() {
    faceAnchor = null;
    overlayStrength = 0;
    lastOverlayWasActive = false;
    fistFrames = 0;
    openFrames = 0;
    bestGesture = { name: 'None', score: 0 };
    resetMotionState();
  }

  function resetMotionState() {
    nodBaselineY = faceAnchor?.y ?? null;
    nodBaselinePitch = faceAnchor?.pitch ?? null;
    nodSignal = 0;
    nodArmed = true;
  }

  function getGestureSignal(result) {
    let best = { name: 'None', score: 0 };
    let closedScore = 0;
    let openScore = 0;

    for (const gestureSet of result.gestures || []) {
      for (const category of gestureSet || []) {
        if (category.score > best.score) {
          best = { name: category.categoryName || 'None', score: category.score };
        }
        if (category.categoryName === 'Closed_Fist') closedScore = Math.max(closedScore, category.score);
        if (category.categoryName === 'Open_Palm') openScore = Math.max(openScore, category.score);
      }
    }

    const landmarkFist = (result.landmarks || []).some(inferClosedFistFromLandmarks);
    return {
      isFist: closedScore >= 0.5 || (closedScore > 0.35 && landmarkFist),
      isOpen: openScore >= 0.4 && openScore >= closedScore,
      best,
    };
  }

  function getFaceAnchor(result) {
    const landmarks = result.faceLandmarks?.[0];
    if (!landmarks?.length) return null;

    const points = landmarks.map(toScreenPoint);
    const eyeA = points[33] || points[130];
    const eyeB = points[263] || points[359];
    const nose = points[1] || points[4];
    const chin = points[152];
    const forehead = points[10];
    const mouth = points[13] || points[14] || points[17];

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    const faceWidth = Math.max(110, maxX - minX);
    const faceHeight = Math.max(130, maxY - minY);
    const headTop = (forehead?.y ?? minY) - faceHeight * 0.18;
    const headBottom = (chin?.y ?? maxY) + faceHeight * 0.03;
    const headHeight = Math.max(150, headBottom - headTop);
    const screenEyes = eyeA && eyeB ? [eyeA, eyeB].sort((a, b) => a.x - b.x) : null;
    const angle = screenEyes
      ? Math.atan2(screenEyes[1].y - screenEyes[0].y, screenEyes[1].x - screenEyes[0].x)
      : 0;

    const eyeMid = screenEyes
      ? {
          x: (screenEyes[0].x + screenEyes[1].x) / 2,
          y: (screenEyes[0].y + screenEyes[1].y) / 2,
        }
      : null;

    let pitch = 0;
    if (nose && eyeMid && chin && forehead) {
      const eyeToChin = Math.max(1, chin.y - eyeMid.y);
      const faceVertical = Math.max(1, chin.y - forehead.y);
      const noseRatio = (nose.y - eyeMid.y) / eyeToChin;
      const mouthRatio = mouth ? (mouth.y - eyeMid.y) / eyeToChin : 0.55;
      const lowerFaceRatio = eyeToChin / faceVertical;
      pitch = clamp(noseRatio * 0.62 + mouthRatio * 0.28 + lowerFaceRatio * 0.1, -0.2, 1.4);
    }

    return {
      x: nose?.x ?? (minX + maxX) / 2,
      y: (headTop + headBottom) / 2,
      width: Math.max(faceWidth * 1.32, headHeight * 0.86),
      height: headHeight * 1.1,
      angle,
      pitch,
    };
  }

  function drawSmileHead(anchor, strength) {
    const image = headImages[currentHeadIndex];
    if (!image?.complete || image.naturalWidth === 0) return;

    const { targetWidth, targetHeight } = getSmileHeadDrawBox(anchor, image, switchFlash * 0.04);
    ctx.save();
    ctx.translate(anchor.x, anchor.y);
    ctx.rotate(anchor.angle);
    ctx.globalAlpha = clamp(strength, 0, 1);
    ctx.shadowBlur = 22 + switchFlash * 18;
    ctx.shadowColor = 'rgba(255, 211, 106, 0.62)';
    ctx.drawImage(image, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);

    if (switchFlash > 0) {
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = switchFlash * 0.42;
      const gradient = ctx.createLinearGradient(0, -targetHeight * 0.46, 0, targetHeight * 0.46);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(255, 236, 172, 0.86)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(-targetWidth * 0.56, -targetHeight * 0.5, targetWidth * 1.12, targetHeight);
    }
    ctx.restore();
  }

  function getSmileHeadDrawBox(anchor, image, extraScale = 0) {
    const imageAspect = image.naturalWidth / image.naturalHeight;
    let targetHeight = anchor.height * (1.04 + extraScale);
    let targetWidth = targetHeight * imageAspect;
    const minWidth = anchor.width * 1.1;
    if (targetWidth < minWidth) {
      targetWidth = minWidth;
      targetHeight = targetWidth / imageAspect;
    }
    return { targetWidth, targetHeight };
  }

  function drawFaceHalo(anchor, strength) {
    ctx.save();
    ctx.translate(anchor.x, anchor.y);
    ctx.rotate(anchor.angle);
    ctx.globalAlpha = strength * 0.22;
    ctx.strokeStyle = 'rgba(255, 211, 106, 0.84)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.ellipse(0, 0, anchor.width * 0.62, anchor.height * 0.54, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function spawnBurst(anchor, count) {
    if (!anchor) return;
    for (let index = 0; index < count; index += 1) {
      const localX = randomRange(-anchor.width * 0.45, anchor.width * 0.45);
      const localY = randomRange(-anchor.height * 0.42, anchor.height * 0.42);
      const rotated = rotate(localX, localY, anchor.angle);
      const direction = Math.atan2(localY, localX) + anchor.angle + randomRange(-0.8, 0.8);
      const speed = randomRange(35, 180);
      const life = randomRange(0.45, 0.9);
      particles.push({
        type: 'spark',
        x: anchor.x + rotated.x,
        y: anchor.y + rotated.y,
        vx: Math.cos(direction) * speed,
        vy: Math.sin(direction) * speed - randomRange(20, 90),
        size: randomRange(2, 7),
        life,
        maxLife: life,
        color: ['#ffd36a', '#d79d78', '#fff4df', '#6ea56f'][Math.floor(Math.random() * 4)],
      });
    }
  }

  function spawnHeadDissolve(anchor, count) {
    const image = headImages[currentHeadIndex];
    if (!anchor || !image?.complete || image.naturalWidth === 0) {
      spawnBurst(anchor, Math.round(count * 0.45));
      return;
    }

    const { targetWidth, targetHeight } = getSmileHeadDrawBox(anchor, image);
    const spriteCount = Math.max(14, Math.round(count * 0.72));

    for (let index = 0; index < spriteCount; index += 1) {
      const theta = randomRange(0, Math.PI * 2);
      const radius = Math.sqrt(Math.random());
      const localX = Math.cos(theta) * targetWidth * 0.46 * radius;
      const localY = Math.sin(theta) * targetHeight * 0.45 * radius;
      const rotated = rotate(localX, localY, anchor.angle);
      const sourceX = clamp((localX / targetWidth + 0.5) * image.naturalWidth, 0, image.naturalWidth - 2);
      const sourceY = clamp((localY / targetHeight + 0.5) * image.naturalHeight, 0, image.naturalHeight - 2);
      const sourceSize = randomRange(18, 38);
      const scale = targetWidth / image.naturalWidth;
      const direction = Math.atan2(localY, localX) + anchor.angle + randomRange(-0.7, 0.7);
      const speed = randomRange(70, 260) * (0.7 + radius * 0.75);
      const life = randomRange(0.72, 1.35);

      particles.push({
        type: 'sprite',
        image,
        sx: clamp(sourceX - sourceSize / 2, 0, image.naturalWidth - sourceSize),
        sy: clamp(sourceY - sourceSize / 2, 0, image.naturalHeight - sourceSize),
        sw: sourceSize,
        sh: sourceSize,
        dw: sourceSize * scale * randomRange(0.85, 1.45),
        dh: sourceSize * scale * randomRange(0.85, 1.45),
        x: anchor.x + rotated.x,
        y: anchor.y + rotated.y,
        vx: Math.cos(direction) * speed,
        vy: Math.sin(direction) * speed - randomRange(40, 155),
        rotation: anchor.angle + randomRange(-0.35, 0.35),
        spin: randomRange(-5.4, 5.4),
        life,
        maxLife: life,
      });
    }

    spawnBurst(anchor, Math.max(10, count - spriteCount));
  }

  function updateAndDrawParticles(now) {
    const dt = Math.min(0.04, (now - (updateAndDrawParticles.lastNow || now)) / 1000);
    updateAndDrawParticles.lastNow = now;

    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.life -= dt;
      if (particle.life <= 0) {
        particles.splice(index, 1);
        continue;
      }

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 1 - dt * 0.58;
      particle.vy += 76 * dt;
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.save();
      ctx.translate(particle.x, particle.y);

      if (particle.type === 'sprite') {
        particle.rotation += particle.spin * dt;
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = Math.pow(alpha, 1.25);
        ctx.shadowBlur = 10 * alpha;
        ctx.shadowColor = 'rgba(255, 211, 106, 0.34)';
        ctx.drawImage(
          particle.image,
          particle.sx,
          particle.sy,
          particle.sw,
          particle.sh,
          -particle.dw / 2,
          -particle.dh / 2,
          particle.dw,
          particle.dh,
        );
      } else {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.5);
      }
      ctx.restore();
    }
  }

  function drawCamera() {
    const { width, height } = getCanvasSize();
    if (!video.videoWidth || !video.videoHeight) {
      paintIdleScene();
      return;
    }

    const rect = getCoverRect(video.videoWidth, video.videoHeight, width, height);
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, rect.x, rect.y, rect.width, rect.height);
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72,
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  function paintIdleScene() {
    resizeCanvas();
    const { width, height } = getCanvasSize();
    ctx.fillStyle = '#080706';
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.5, height * 0.42, 0, width * 0.5, height * 0.42, width * 0.65);
    glow.addColorStop(0, 'rgba(255, 211, 106, 0.15)');
    glow.addColorStop(0.46, 'rgba(215, 157, 120, 0.08)');
    glow.addColorStop(1, 'rgba(8, 7, 6, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
    drawFaceHalo(getDemoAnchor(), 0.36);
  }

  function emitReadout(now, force = false) {
    if (!force && now - lastReadoutAt < 150) return;
    lastReadoutAt = now;
    onReadout({
      face: Boolean(faceAnchor),
      gesture: GESTURE_LABELS[bestGesture.name] || bestGesture.name || '等待手势',
      score: bestGesture.score,
      headName: SMILE_HEADS[currentHeadIndex][0],
      nod: nodSignal,
    });
  }

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, performanceProfile.maxDpr);
    const targetWidth = Math.max(1, Math.round(bounds.width * dpr));
    const targetHeight = Math.max(1, Math.round(bounds.height * dpr));
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function toScreenPoint(landmark) {
    const { width, height } = getCanvasSize();
    const rect = getCoverRect(video.videoWidth, video.videoHeight, width, height);
    const naturalX = rect.x + landmark.x * rect.width;
    return {
      x: width - naturalX,
      y: rect.y + landmark.y * rect.height,
      z: landmark.z,
    };
  }

  function getCanvasSize() {
    return { width: canvas.clientWidth, height: canvas.clientHeight };
  }

  function getDemoAnchor() {
    const { width, height } = getCanvasSize();
    const size = Math.min(width, height);
    return {
      x: width / 2,
      y: height * 0.46,
      width: size * 0.38,
      height: size * 0.46,
      angle: 0,
      pitch: 0,
    };
  }

  return { start, stop, destroy, switchHead };
}

function inferClosedFistFromLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 21) return false;
  const palm = averagePoint([landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]]);
  const tips = [8, 12, 16, 20];
  const mcps = [5, 9, 13, 17];
  const palmSpan = distance(landmarks[5], landmarks[17]) || 0.08;
  let curled = 0;

  for (let index = 0; index < tips.length; index += 1) {
    const tipDistance = distance(landmarks[tips[index]], palm);
    const mcpDistance = distance(landmarks[mcps[index]], palm);
    if (tipDistance < mcpDistance * 1.28 || tipDistance < palmSpan * 0.5) curled += 1;
  }
  return curled >= 3;
}

function smoothAnchor(current, target, amount) {
  if (!current) return { ...target };
  return {
    x: lerp(current.x, target.x, amount),
    y: lerp(current.y, target.y, amount),
    width: lerp(current.width, target.width, amount),
    height: lerp(current.height, target.height, amount),
    angle: lerp(current.angle, target.angle, amount),
    pitch: lerp(current.pitch, target.pitch, amount),
  };
}

function getCoverRect(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return {
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) / 2,
    width,
    height,
  };
}

export function isInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /MicroMessenger|QQ\/|Weibo|WeiBo|DingTalk|Alipay/i.test(navigator.userAgent);
}

function getFriendlyError(error) {
  const inApp = isInAppBrowser();
  if (error?.name === 'NotAllowedError') {
    return inApp
      ? '摄像头被限制，请点右上角「···」选择在浏览器中打开后重试'
      : '摄像头权限未开启';
  }
  if (error?.name === 'NotFoundError') return '没有找到可用摄像头';
  if (error?.name === 'NotReadableError') return '摄像头正被其他应用占用';
  if (inApp) return '当前应用内置浏览器可能限制摄像头，请点右上角菜单选择在浏览器中打开';
  return error?.message || '启动失败，请刷新后重试';
}

function averagePoint(points) {
  const total = points.reduce(
    (sum, point) => ({
      x: sum.x + point.x,
      y: sum.y + point.y,
      z: sum.z + (point.z || 0),
    }),
    { x: 0, y: 0, z: 0 },
  );
  return {
    x: total.x / points.length,
    y: total.y / points.length,
    z: total.z / points.length,
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

function rotate(x, y, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
