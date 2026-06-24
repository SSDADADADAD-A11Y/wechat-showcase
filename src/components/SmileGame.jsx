import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Hand,
  Maximize2,
  Minimize2,
  Play,
  ScanFace,
  SmilePlus,
  Square,
} from 'lucide-react';
import { createSmileGame, SMILE_HEADS } from '../game/createSmileGame';
import './SmileGame.css';

const initialReadout = {
  face: false,
  gesture: '等待手势',
  score: 0,
  headName: SMILE_HEADS[0][0],
  nod: 0,
};

export default function SmileGame({ standalone = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const engineRef = useRef(null);
  const thresholdRef = useRef(0.045);

  const [status, setStatus] = useState('准备就绪');
  const [gameState, setGameState] = useState({ loading: false, running: false });
  const [readout, setReadout] = useState(initialReadout);
  const [headIndex, setHeadIndex] = useState(0);
  const [threshold, setThreshold] = useState(0.045);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    engineRef.current = createSmileGame({
      video: videoRef.current,
      canvas: canvasRef.current,
      getThreshold: () => thresholdRef.current,
      onStatus: setStatus,
      onState: setGameState,
      onReadout: setReadout,
      onHeadChange: ({ index }) => setHeadIndex(index),
    });

    const autoStartTimer =
      import.meta.env.DEV && new URLSearchParams(window.location.search).has('autostart')
        ? window.setTimeout(() => engineRef.current?.start(), 0)
        : 0;

    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    setCanFullscreen(Boolean(stageRef.current?.requestFullscreen));
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
      window.clearTimeout(autoStartTimer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('game-camera-active', gameState.running);
    return () => document.body.classList.remove('game-camera-active');
  }, [gameState.running]);

  const updateThreshold = (event) => {
    const value = Number(event.target.value);
    thresholdRef.current = value;
    setThreshold(value);
  };

  const toggleFullscreen = async () => {
    if (!stageRef.current?.requestFullscreen) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await stageRef.current.requestFullscreen();
  };

  const gestureScore = readout.score ? `${Math.round(readout.score * 100)}%` : '--';

  return (
    <section className={`smile-game${standalone ? ' smile-game--standalone' : ''}`} id="game">
      <div className={standalone ? 'smile-game__standalone' : 'container'}>
        {!standalone && <div className="smile-game__heading">
          <div>
            <span className="smile-game__eyebrow">互动实验室 · 01</span>
            <h2>笑脸变装小游戏</h2>
          </div>
          <p>用一个握拳叫出笑脸，点头换装，张开手掌让它碎成光尘。</p>
        </div>}

        <div
          className={`smile-game__stage${gameState.running ? ' smile-game__stage--running' : ''}`}
          ref={stageRef}
        >
          <video ref={videoRef} className="smile-game__video" playsInline muted />
          <canvas ref={canvasRef} className="smile-game__canvas" />

          <div className="smile-game__topbar">
            <div className="smile-game__topbar-main">
              {standalone && (
                <a className="smile-game__back" href="/" title="返回网站" aria-label="返回网站">
                  <ArrowLeft size={19} aria-hidden="true" />
                </a>
              )}
              <div className="smile-game__brand">
                <ScanFace size={18} aria-hidden="true" />
                <span>笑脸捕捉器</span>
              </div>
            </div>
            <div className="smile-game__status" aria-live="polite">
              <span className={gameState.running ? 'is-live' : ''} />
              {status}
            </div>
          </div>

          {gameState.running && (
            <aside className="smile-game__telemetry" aria-label="识别状态">
              <div>
                <span>脸部</span>
                <strong>{readout.face ? '已锁定' : '寻找中'}</strong>
              </div>
              <div>
                <span>手势</span>
                <strong>{readout.gesture}</strong>
              </div>
              <div>
                <span>置信度</span>
                <strong>{gestureScore}</strong>
              </div>
            </aside>
          )}

          {!gameState.running && !gameState.loading && (
            <div className="smile-game__welcome">
              <div className="smile-game__head-stack" aria-hidden="true">
                {[0, 4, 8].map((index) => (
                  <img
                    key={SMILE_HEADS[index][1]}
                    src={SMILE_HEADS[index][1]}
                    alt=""
                  />
                ))}
              </div>
              <h3>镜头里的你，今天是哪种笑？</h3>
              <div className="smile-game__moves" aria-label="玩法">
                <span><Hand size={17} aria-hidden="true" />握拳出现</span>
                <span><ScanFace size={17} aria-hidden="true" />点头切换</span>
                <span><SmilePlus size={17} aria-hidden="true" />张掌消散</span>
              </div>
              <button className="smile-game__start" type="button" onClick={() => engineRef.current?.start()}>
                <Play size={20} fill="currentColor" aria-hidden="true" />
                开始游戏
              </button>
            </div>
          )}

          {gameState.loading && (
            <div className="smile-game__loading" role="status">
              <span />
              <strong>{status}</strong>
            </div>
          )}

          {gameState.running && (
            <div className="smile-game__controls">
              <button
                type="button"
                className="smile-game__icon-btn smile-game__icon-btn--stop"
                onClick={() => engineRef.current?.stop()}
                title="停止摄像头"
                aria-label="停止摄像头"
              >
                <Square size={18} fill="currentColor" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="smile-game__icon-btn"
                onClick={() => engineRef.current?.switchHead()}
                title="切换笑脸"
                aria-label="切换笑脸"
              >
                <SmilePlus size={20} aria-hidden="true" />
              </button>
              {canFullscreen && (
                <button
                  type="button"
                  className="smile-game__icon-btn"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? '退出全屏' : '全屏'}
                  aria-label={isFullscreen ? '退出全屏' : '全屏'}
                >
                  {isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
                </button>
              )}
              <label className="smile-game__sensitivity">
                <span>点头灵敏度</span>
                <input
                  type="range"
                  min="0.02"
                  max="0.12"
                  step="0.005"
                  value={threshold}
                  onChange={updateThreshold}
                />
              </label>
            </div>
          )}

          <div className="smile-game__counter" aria-live="polite">
            <span>{String(headIndex + 1).padStart(2, '0')}</span>
            <div>
              <small>当前笑脸</small>
              <strong>{SMILE_HEADS[headIndex][0]}</strong>
            </div>
          </div>

          <div className="smile-game__corner" aria-hidden="true">
            <Camera size={16} />
            {gameState.modeLabel || '本地实时处理'}
          </div>
        </div>
      </div>
    </section>
  );
}
