import { Brush, Gift, MessageCircle, ScanLine } from 'lucide-react';

const features = [
  {
    icon: Brush,
    title: '原创视觉',
    text: '从角色、纹样到色彩气质都独立构思，避免模板感，让封面有自己的记忆点。',
  },
  {
    icon: Gift,
    title: '红包场景',
    text: '围绕春节、生日、祝福、纪念日等真实使用场景做系列化设计。',
  },
  {
    icon: ScanLine,
    title: '轻松领取',
    text: '关注公众号后第一时间获取上新提醒，新账号内容会逐步发布。',
  },
  {
    icon: MessageCircle,
    title: '共创反馈',
    text: '欢迎在公众号留言想要的主题，我们会把高频灵感做成后续系列。',
  },
];

export default function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Studio Signal</span>
          <h2 className="section-title">不是普通资料页，是一个正在生长的封面工作室</h2>
          <p className="section-desc">
            视觉便签目前是新建公众号，我们先把审美、玩法和领取入口做好，内容会按系列持续上线。
          </p>
        </div>

        <div className="about__grid">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <article className="about__card" key={item.title} style={{ '--i': index }}>
                <div className="about__icon">
                  <Icon size={26} aria-hidden="true" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
