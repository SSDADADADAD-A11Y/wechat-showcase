export default function QRCode() {
  return (
    <section id="qrcode" className="qrcode">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">关注我们</span>
          <h2 className="section-title">扫码关注，免费领封面</h2>
          <p className="section-desc">打开微信扫一扫，第一时间获取新款红包封面上线通知</p>
        </div>

        <div className="qrcode__card">
          <div className="qrcode__image-wrapper">
            <img src="/qrcode.jpg" alt="视觉便签公众号二维码" className="qrcode__image" />
          </div>
          <div className="qrcode__info">
            <h3>关注只需两步</h3>
            <ol>
              <li>
                <strong>📱 打开微信</strong>
                <span>点击右上角「+」选择「扫一扫」</span>
              </li>
              <li>
                <strong>📷 扫描二维码</strong>
                <span>关注后即可免费领取红包封面</span>
              </li>
            </ol>
            <div className="qrcode__name">
              <span className="qrcode__name-label">公众号名称</span>
              <strong>视觉便签</strong>
            </div>
            <div className="qrcode__id">
              <span className="qrcode__id-label">微信号</span>
              <code>hebuter00409</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
