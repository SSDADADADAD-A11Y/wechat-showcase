import { useState, useEffect } from 'react';
import { Gamepad2 } from 'lucide-react';

const navItems = [
  { id: 'hero', label: '首页' },
  { id: 'about', label: '关于' },
  { id: 'articles', label: '文章' },
  { id: 'game', label: '小游戏', href: '/game' },
  { id: 'qrcode', label: '关注' },
  { id: 'contact', label: '联系' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="header__inner">
        <a className="header__logo" href="#hero" onClick={() => scrollTo('hero')}>
          📢 视觉便签
        </a>
        <nav className={`header__nav${mobileOpen ? ' header__nav--open' : ''}`}>
          {navItems.map((item) => (
            <a
              key={item.id}
              className={item.href ? 'header__game-link' : undefined}
              href={item.href || `#${item.id}`}
              onClick={item.href ? undefined : () => scrollTo(item.id)}
            >
              {item.href && <Gamepad2 size={16} aria-hidden="true" />}
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className="header__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="菜单"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
