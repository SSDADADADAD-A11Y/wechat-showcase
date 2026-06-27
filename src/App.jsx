import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Articles from './components/Articles';
import GameEntry from './components/GameEntry';
import QRCode from './components/QRCode';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import ParticleField from './components/ParticleField';
import './App.css';

const REVEAL_SELECTORS = [
  '.section-header',
  '.about__card',
  '.articles__coming',
  '.qrcode__card',
  '.contact__card',
  '.contact__note',
  '.game-entry__inner',
];

function App() {
  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (!targetId) return undefined;

    const timer = window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) window.scrollTo({ top: target.offsetTop, behavior: 'auto' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(REVEAL_SELECTORS.join(',')));
    if (!elements.length) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('reveal', 'is-visible'));
      return undefined;
    }

    const grouped = new Map();
    elements.forEach((el) => {
      el.classList.add('reveal');
      const parent = el.parentElement;
      const peers = grouped.get(parent) || [];
      el.style.transitionDelay = `${Math.min(peers.length * 90, 360)}ms`;
      peers.push(el);
      grouped.set(parent, peers);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ParticleField />
      <Header />
      <main>
        <Hero />
        <About />
        <Articles />
        <GameEntry />
        <QRCode />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

export default App;
