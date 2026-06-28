import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand">
            <h3>视觉便签</h3>
            <p>原创微信红包封面设计团队</p>
          </div>
          <div className="footer__links">
            <h4>快速导航</h4>
            <a onClick={() => scrollTo('about')}>关于我们</a>
            <a onClick={() => scrollTo('articles')}>封面计划</a>
            <a href="/game">笑脸小游戏</a>
            <a onClick={() => scrollTo('qrcode')}>关注公众号</a>
          </div>
          <div className="footer__back">
            <button onClick={scrollToTop} className="footer__top-btn" aria-label="回到顶部">
              <ArrowUp size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2026 视觉便签. Made for original red packet covers.</p>
        </div>
      </div>
    </footer>
  );
}
