import { Camera, Play, Sparkles } from 'lucide-react';
import { SMILE_HEADS } from '../game/createSmileGame';
import './GameEntry.css';

const previewHeads = [0, 3, 7, 15];

export default function GameEntry() {
  return (
    <section className="game-entry" id="game">
      <div className="container game-entry__inner">
        <div className="game-entry__content">
          <span className="game-entry__eyebrow">Interactive Lab 01</span>
          <h2>镜头里的你，今天是哪一种笑？</h2>
          <p>
            进入独立小游戏页面，用摄像头识别笑容和手势，切换 24 种表情头像。
            识别逻辑已放入 Web Worker，手机会自动启用轻量模式。
          </p>
          <div className="game-entry__actions">
            <a className="game-entry__button" href="/game">
              <Play size={19} fill="currentColor" aria-hidden="true" />
              进入小游戏
            </a>
            <span><Camera size={16} aria-hidden="true" />摄像头画面仅在本地处理</span>
          </div>
        </div>

        <a className="game-entry__preview" href="/game" aria-label="进入笑脸变装小游戏">
          <div className="game-entry__heads" aria-hidden="true">
            {previewHeads.map((index) => (
              <img key={SMILE_HEADS[index][1]} src={SMILE_HEADS[index][1]} alt="" />
            ))}
          </div>
          <div className="game-entry__preview-label">
            <Sparkles size={16} aria-hidden="true" />
            24 种笑脸待解锁
          </div>
          <span className="game-entry__play" aria-hidden="true"><Play size={24} fill="currentColor" /></span>
        </a>
      </div>
    </section>
  );
}
