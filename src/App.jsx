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
import './App.css';

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

  return (
    <>
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
