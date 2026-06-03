import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Articles from './components/Articles';
import QRCode from './components/QRCode';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import './App.css';

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Articles />
        <QRCode />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

export default App;
