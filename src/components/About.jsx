export default function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">关于我们</span>
          <h2 className="section-title">视觉便签 —— 专注红包封面设计</h2>
          <p className="section-desc">一个热爱设计的小团队，用创意点亮每一个红包时刻</p>
        </div>

        <div className="about__grid">
          <div className="about__card">
            <div className="about__icon">🎨</div>
            <h3>原创设计</h3>
            <p>
              每一款红包封面均为团队原创设计，从构思到定稿精心打磨，
              拒绝模板化，确保每一款作品都独一无二。
            </p>
          </div>
          <div className="about__card">
            <div className="about__icon">🧧</div>
            <h3>封面类型</h3>
            <p>
              涵盖节日限定、国潮风格、可爱萌宠、极简文艺等多元风格，
              满足不同场景和审美的红包封面需求。
            </p>
          </div>
          <div className="about__card">
            <div className="about__icon">🆓</div>
            <h3>免费领取</h3>
            <p>
              关注公众号即可免费领取精选红包封面，定期更新新款上线，
              让每一次发红包都成为视觉享受。
            </p>
          </div>
          <div className="about__card">
            <div className="about__icon">💬</div>
            <h3>互动社区</h3>
            <p>
              欢迎在公众号留言提出你的创意想法，好的设计灵感
              可能来自每一位读者的建议，一起打造更美的封面。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
