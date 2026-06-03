export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">联系我们</span>
          <h2 className="section-title">期待与你的交流</h2>
          <p className="section-desc">封面定制、合作、建议，欢迎随时联系</p>
        </div>

        <div className="contact__grid">
          <div className="contact__card">
            <div className="contact__icon">📧</div>
            <h3>电子邮箱</h3>
            <p>商务合作 / 封面定制</p>
            <a>2469208561@qq.com</a>
          </div>
          <div className="contact__card">
            <div className="contact__icon">💬</div>
            <h3>公众号留言</h3>
            <p>最快获得回复的方式</p>
            <span>直接在公众号文章下留言</span>
          </div>
          <div className="contact__card">
            <div className="contact__icon">🎨</div>
            <h3>定制合作</h3>
            <p>企业定制 / 品牌联名封面</p>
            <span>请发送邮件注明合作需求</span>
          </div>
          <div className="contact__card">
            <div className="contact__icon">📱</div>
            <h3>联系手机</h3>
            <p>紧急事务 / 电话联系</p>
            <a>18519717419</a>
          </div>
        </div>

        <div className="contact__note">
          <p>
            💡 <strong>小提示：</strong>
            新款红包封面通常在公众号首发，关注后设为星标，确保第一时间收到上线通知。在公众号后台留言通常会在 24 小时内回复！
          </p>
        </div>
      </div>
    </section>
  );
}
