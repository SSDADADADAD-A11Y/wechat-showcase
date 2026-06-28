import { ArrowRight, CalendarClock, Crown, Flower2, HeartHandshake, Sparkles } from 'lucide-react';

const series = [
  {
    title: '国潮祥纹系列',
    desc: '祥云、窗棂、金线和朱砂色，适合春节、开工、拜年场景。',
    status: '设计中',
    icon: Crown,
  },
  {
    title: '节日限定系列',
    desc: '把节气、生日、纪念日做成轻量封面，适合日常分享。',
    status: '排期中',
    icon: Flower2,
  },
  {
    title: '温柔祝福系列',
    desc: '少一点喧闹，多一点情绪，给朋友、家人、恋人的小心意。',
    status: '构思中',
    icon: HeartHandshake,
  },
];

export default function Articles() {
  return (
    <section id="articles" className="articles">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Cover Roadmap</span>
          <h2 className="section-title">首批原创红包封面正在准备</h2>
          <p className="section-desc">
            新账号暂时还没有发布内容，所以这里先展示我们的上新方向。关注公众号后，会第一时间收到领取提醒。
          </p>
        </div>

        <div className="articles__showcase">
          <article className="articles__hero-card">
            <div className="articles__hero-noise" aria-hidden="true" />
            <div className="articles__hero-top">
              <span>Preview 001</span>
              <CalendarClock size={18} aria-hidden="true" />
            </div>
            <h3>红包封面不该只是“能用”，它也可以有审美和故事。</h3>
            <p>
              我们会把每一批封面做成可识别的主题系列，发布时同步说明设计灵感、适用场景和领取方式。
            </p>
            <a onClick={() => document.getElementById('qrcode')?.scrollIntoView({ behavior: 'smooth' })}>
              关注等待首发
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </article>

          <div className="articles__series">
            {series.map((item) => {
              const Icon = item.icon;
              return (
                <article className="articles__series-card" key={item.title}>
                  <div className="articles__series-icon">
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <span>{item.status}</span>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="articles__ticker" aria-hidden="true">
          <span><Sparkles size={15} />原创封面</span>
          <span>微信红包</span>
          <span>东方视觉</span>
          <span>节日祝福</span>
          <span>扫码关注</span>
        </div>
      </div>
    </section>
  );
}
