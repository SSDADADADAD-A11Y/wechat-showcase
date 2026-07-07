import { useState, useEffect } from 'react';
import { Calculator, Gamepad2, Menu, X } from 'lucide-react';

const navItems = [
  { id: 'hero', label: '首页' },
  { id: 'about', label: '团队' },
  { id: 'articles', label: '封面' },
  { id: 'game', label: '小游戏', href: '/game', icon: Gamepad2, variant: 'gold' },
  { id: 'ledger', label: '记账智能体', href: '/ledger/', icon: Calculator, variant: 'jade' },
  { id: 'qrcode', label: '关注' },
  { id: 'contact', label: '联系' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    onScroll();
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
          <span>视觉便签</span>
          <small>Red Packet Covers</small>
        </a>
        <nav className={`header__nav${mobileOpen ? ' header__nav--open' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                className={item.variant ? `header__special-link header__special-link--${item.variant}` : undefined}
                href={item.href || `#${item.id}`}
                onClick={item.href ? undefined : () => scrollTo(item.id)}
              >
                {Icon && <Icon size={16} aria-hidden="true" />}
                {item.label}
              </a>
            );
          })}
        </nav>
        <button
          className="header__hamburger"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
