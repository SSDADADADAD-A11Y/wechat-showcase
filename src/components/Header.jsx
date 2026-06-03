import { useState, useEffect } from 'react';

const navItems = [
  { id: 'hero', label: '首页' },
  { id: 'about', label: '关于' },
  { id: 'articles', label: '文章' },
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
        <a className="header__logo" onClick={() => scrollTo('hero')}>
          📢 视觉便签
        </a>
        <nav className={`header__nav${mobileOpen ? ' header__nav--open' : ''}`}>
          {navItems.map((item) => (
            <a key={item.id} onClick={() => scrollTo(item.id)}>
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
