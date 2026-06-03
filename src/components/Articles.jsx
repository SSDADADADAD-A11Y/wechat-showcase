export default function Articles() {
  return (
    <section id="articles" className="articles">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">封面作品</span>
          <h2 className="section-title">原创红包封面即将上线</h2>
          <p className="section-desc">团队正在精心打磨每一款封面，敬请期待</p>
        </div>

        <div className="articles__coming">
          <div className="articles__coming-icon">🧧</div>
          <h3>首批封面正在设计中</h3>
          <p>
            我们正在创作第一批原创微信红包封面，涵盖节日限定、国潮经典、可爱萌宠等多种风格。
            每一款都经过精心设计和反复打磨，只为给你带来最好的视觉体验。
          </p>
          <div className="articles__coming-list">
            <div className="articles__coming-item">
              <span className="articles__coming-emoji">🐉</span>
              <span>国潮经典系列</span>
              <span className="articles__coming-status">设计中</span>
            </div>
            <div className="articles__coming-item">
              <span className="articles__coming-emoji">🌸</span>
              <span>节日限定系列</span>
              <span className="articles__coming-status">设计中</span>
            </div>
            <div className="articles__coming-item">
              <span className="articles__coming-emoji">🐱</span>
              <span>可爱萌宠系列</span>
              <span className="articles__coming-status">设计中</span>
            </div>
            <div className="articles__coming-item">
              <span className="articles__coming-emoji">✨</span>
              <span>极简文艺系列</span>
              <span className="articles__coming-status">构思中</span>
            </div>
          </div>
          <div className="articles__coming-cta">
            <p>关注公众号，第一时间获取封面上线通知</p>
            <a onClick={() => document.getElementById('qrcode').scrollIntoView({ behavior: 'smooth' })} className="btn btn--primary">
              扫码关注，抢占先机 →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
