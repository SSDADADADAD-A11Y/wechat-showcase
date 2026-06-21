import { useEffect } from 'react';
import SmileGame from './components/SmileGame';

export default function GamePage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = '笑脸变装小游戏 | 视觉便签';
    document.body.classList.add('smile-game-page');

    return () => {
      document.title = previousTitle;
      document.body.classList.remove('smile-game-page');
    };
  }, []);

  return (
    <main className="game-page">
      <SmileGame standalone />
    </main>
  );
}
