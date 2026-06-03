export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            <h3>🧧 视觉便签</h3>
            <p>原创微信红包封面设计团队</p>
          </div>
          <div className="footer__links">
            <h4>快速导航</h4>
            <a onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>关于我们</a>
            <a onClick={() => document.getElementById('articles').scrollIntoView({ behavior: 'smooth' })}>封面作品</a>
            <a onClick={() => document.getElementById('qrcode').scrollIntoView({ behavior: 'smooth' })}>关注公众号</a>
            <a onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>联系方式</a>
          </div>
          <div className="footer__back">
            <button onClick={scrollToTop} className="footer__top-btn" aria-label="回到顶部">
              ↑
            </button>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2026 视觉便签. All rights reserved. Made with ❤️</p>
        </div>
      </div>
    </footer>
  );
}
