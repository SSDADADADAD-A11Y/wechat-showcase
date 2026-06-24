import {
  FaceLandmarker,
  FilesetResolver,
  GestureRecognizer,
} from '@mediapipe/tasks-vision';

const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';
const GESTURE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/latest/gesture_recognizer.task';

let faceLandmarker = null;
let gestureRecognizer = null;
let ready = false;

self.addEventListener('message', async (event) => {
  const message = event.data;

  if (message.type === 'init') {
    await initializeTasks(message.numHands || 1);
    return;
  }

  if (message.type === 'detect') {
    await detectFrame(
      message.bitmap,
      message.timestampMs,
      message.requestId,
      message.generation,
    );
    return;
  }

  if (message.type === 'dispose') {
    closeTasks();
    self.close();
  }
});

async function initializeTasks(numHands) {
  try {
    const vision = await FilesetResolver.forVisionTasks(WASM_ROOT, true);
    vision.wasmLoaderPath = `${WASM_ROOT}/vision_wasm_module_internal.js`;
    const wasmLoader = await import(/* @vite-ignore */ vision.wasmLoaderPath);
    const wasmModuleFactory = wasmLoader.default;
    vision.wasmLoaderPath = undefined;

    let delegate = 'GPU';
    try {
      await createTasks(vision, wasmModuleFactory, delegate, numHands);
    } catch (error) {
      console.warn('Worker GPU delegate unavailable, using CPU.', error);
      closeTasks();
      delegate = 'CPU';
      await createTasks(vision, wasmModuleFactory, delegate, numHands);
    }

    ready = true;
    self.postMessage({ type: 'ready', delegate });
  } catch (error) {
    closeTasks();
    self.postMessage({ type: 'error', message: error?.message || '识别模型加载失败' });
  }
}

async function createTasks(vision, wasmModuleFactory, delegate, numHands) {
  self.ModuleFactory = wasmModuleFactory;
  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: FACE_MODEL, delegate },
    runningMode: 'VIDEO',
    numFaces: 1,
    minFaceDetectionConfidence: 0.45,
    minFacePresenceConfidence: 0.45,
    minTrackingConfidence: 0.45,
  });

  self.ModuleFactory = wasmModuleFactory;
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: { modelAssetPath: GESTURE_MODEL, delegate },
    runningMode: 'VIDEO',
    numHands,
    minHandDetectionConfidence: 0.48,
    minHandPresenceConfidence: 0.48,
    minTrackingConfidence: 0.48,
    cannedGesturesClassifierOptions: { scoreThreshold: 0.18 },
  });
}

async function detectFrame(bitmap, timestampMs, requestId, generation) {
  if (!bitmap) return;

  try {
    if (!ready || !faceLandmarker || !gestureRecognizer) {
      throw new Error('识别模型尚未就绪');
    }

    const faceResult = faceLandmarker.detectForVideo(bitmap, timestampMs);
    const gestureResult = gestureRecognizer.recognizeForVideo(bitmap, timestampMs);

    self.postMessage({
      type: 'result',
      requestId,
      generation,
      faceLandmarks: serializeLandmarks(faceResult.faceLandmarks),
      gestures: serializeGestures(gestureResult.gestures),
      handLandmarks: serializeLandmarks(gestureResult.landmarks),
    });
  } catch (error) {
    self.postMessage({
      type: 'detect-error',
      requestId,
      generation,
      message: error?.message || '画面识别失败',
    });
  } finally {
    bitmap.close?.();
  }
}

function serializeLandmarks(collections = []) {
  return collections.map((landmarks) =>
    landmarks.map((point) => ({ x: point.x, y: point.y, z: point.z || 0 })),
  );
}

function serializeGestures(collections = []) {
  return collections.map((categories) =>
    categories.map((category) => ({
      categoryName: category.categoryName || 'None',
      score: category.score || 0,
    })),
  );
}

function closeTasks() {
  ready = false;
  faceLandmarker?.close?.();
  gestureRecognizer?.close?.();
  faceLandmarker = null;
  gestureRecognizer = null;
}
