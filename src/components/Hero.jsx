import { ArrowDown, Sparkles, Wand2, QrCode, Gamepad2 } from 'lucide-react';

const coverTiles = [
  { name: '新年红包', tag: '东方瑞色', tone: 'scarlet' },
  { name: '好运签', tag: '手绘纹样', tone: 'gold' },
  { name: '小福气', tag: '限定封面', tone: 'jade' },
];

const shards = ['gold', 'red', 'jade', 'gold', 'red', 'jade'];

export default function Hero() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero">
      <div className="hero__ambient" aria-hidden="true" />
      <div className="hero__depth-grid" aria-hidden="true" />
      <div className="hero__content">
        <div className="hero__badge">
          <Sparkles size={16} aria-hidden="true" />
          原创微信红包封面实验室
        </div>
        <h1 className="hero__title">
          视觉便签
          <span>把每一次祝福，做成值得收藏的封面。</span>
        </h1>
        <p className="hero__subtitle">
          我们为微信红包封面设计原创视觉：东方纹样、节日情绪、趣味角色和互动玩法，
          让一个简单的红包，也有被记住的质感。
        </p>
        <div className="hero__actions">
          <button type="button" onClick={() => scrollTo('articles')} className="btn btn--primary">
            <Wand2 size={18} aria-hidden="true" />
            看封面计划
          </button>
          <a href="/game" className="btn btn--outline">
            <Gamepad2 size={18} aria-hidden="true" />
            玩笑脸小游戏
          </a>
        </div>
        <div className="hero__signal">
          <span>公众号</span>
          <strong>hebuter00409</strong>
          <button type="button" onClick={() => scrollTo('qrcode')} aria-label="跳转到二维码">
            <QrCode size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="hero__visual" aria-label="红包封面视觉预览">
        <div className="hero__halo hero__halo--front" aria-hidden="true" />
        <div className="hero__halo hero__halo--back" aria-hidden="true" />
        <div className="hero__orbit hero__orbit--one" />
        <div className="hero__orbit hero__orbit--two" />
        <div className="hero__shards" aria-hidden="true">
          {shards.map((tone, index) => (
            <span key={`${tone}-${index}`} className={`hero__shard hero__shard--${tone}`} style={{ '--i': index }} />
          ))}
        </div>
        <div className="hero__phone">
          <div className="hero__phone-top">
            <span />
            <span>VISUAL NOTE</span>
          </div>
          <div className="hero__cover-stack">
            {coverTiles.map((tile, index) => (
              <article key={tile.name} className={`hero__cover hero__cover--${tile.tone}`} style={{ '--i': index }}>
                <small>{tile.tag}</small>
                <strong>{tile.name}</strong>
                <span>领取提醒即将开放</span>
              </article>
            ))}
          </div>
        </div>
        <div className="hero__floating-card hero__floating-card--left">
          <span>01</span>
          <strong>原创</strong>
          <small>不是模板换字</small>
        </div>
        <div className="hero__floating-card hero__floating-card--right">
          <span>24</span>
          <strong>笑脸</strong>
          <small>互动页面已上线</small>
        </div>
      </div>

      <button type="button" className="hero__scroll" onClick={() => scrollTo('about')} aria-label="继续向下浏览">
        <ArrowDown size={20} aria-hidden="true" />
      </button>
    </section>
  );
}
