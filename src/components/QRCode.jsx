import { ScanQrCode, Smartphone, Star } from 'lucide-react';

export default function QRCode() {
  return (
    <section id="qrcode" className="qrcode">
      <div className="container">
        <div className="qrcode__card">
          <div className="qrcode__image-stage">
            <div className="qrcode__scan-line" aria-hidden="true" />
            <img src="/qrcode.jpg" alt="视觉便签公众号二维码" className="qrcode__image" />
          </div>
          <div className="qrcode__info">
            <span className="section-tag">Follow WeChat</span>
            <h2>扫码关注，等第一批原创红包封面上线</h2>
            <p>
              打开微信扫一扫，搜索或扫码关注公众号「视觉便签」。新封面上线、领取入口和设计说明都会优先在公众号发布。
            </p>
            <div className="qrcode__steps">
              <div>
                <Smartphone size={20} aria-hidden="true" />
                <span>打开微信</span>
              </div>
              <div>
                <ScanQrCode size={20} aria-hidden="true" />
                <span>扫描二维码</span>
              </div>
              <div>
                <Star size={20} aria-hidden="true" />
                <span>设为星标更稳</span>
              </div>
            </div>
            <div className="qrcode__id">
              <span>微信号</span>
              <code>hebuter00409</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
