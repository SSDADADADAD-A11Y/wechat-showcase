export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero__content">
        <div className="hero__badge">🧧 微信红包封面</div>
        <h1 className="hero__title">
          让你的红包<span className="hero__highlight">与众不同</span>
        </h1>
        <p className="hero__subtitle">
          视觉便签团队专注原创微信红包封面设计，每一款封面都是独特的视觉作品。
          用精心设计的封面，让你的每一份心意都更有温度。
        </p>
        <div className="hero__actions">
          <a onClick={() => document.getElementById('articles').scrollIntoView({ behavior: 'smooth' })} className="btn btn--primary">
            浏览封面
          </a>
          <a onClick={() => document.getElementById('qrcode').scrollIntoView({ behavior: 'smooth' })} className="btn btn--outline">
            立即关注
          </a>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <strong>🎨</strong>
            <span>原创设计</span>
          </div>
          <div className="hero__stat">
            <strong>🆓</strong>
            <span>关注即领</span>
          </div>
          <div className="hero__stat">
            <strong>🔥</strong>
            <span>即将上线</span>
          </div>
        </div>
      </div>
      <div className="hero__visual">
        <div className="hero__card">
          <div className="hero__card-icon">🧧</div>
          <div className="hero__card-title">最新封面</div>
          <div className="hero__card-text">每期精心设计独家红包封面，关注公众号第一时间领取</div>
          <div className="hero__card-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </section>
  );
}
