import { Mail, MessageSquareText, Phone, Sparkles } from 'lucide-react';

const contacts = [
  {
    icon: Mail,
    title: '邮箱',
    desc: '合作、定制、素材沟通',
    value: '2469208561@qq.com',
    href: 'mailto:2469208561@qq.com',
  },
  {
    icon: Phone,
    title: '手机',
    desc: '紧急事项可电话联系',
    value: '18519717419',
    href: 'tel:18519717419',
  },
  {
    icon: MessageSquareText,
    title: '公众号留言',
    desc: '主题建议和领取反馈',
    value: '视觉便签',
  },
  {
    icon: Sparkles,
    title: '定制合作',
    desc: '品牌联名、活动封面',
    value: '欢迎来信说明需求',
  },
];

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Contact</span>
          <h2 className="section-title">想做一套自己的红包封面，可以直接联系</h2>
          <p className="section-desc">合作、定制、建议都可以发来。公众号后台留言通常更适合日常沟通。</p>
        </div>

        <div className="contact__grid">
          {contacts.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon size={25} aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <strong>{item.value}</strong>
              </>
            );
            return item.href ? (
              <a className="contact__card" href={item.href} key={item.title}>
                {content}
              </a>
            ) : (
              <article className="contact__card" key={item.title}>
                {content}
              </article>
            );
          })}
        </div>

        <div className="contact__note">
          <p>
            小提示：公众号是新账号，内容会逐步发布。先关注并设为星标，后续上新不容易错过。
          </p>
        </div>
      </div>
    </section>
  );
}
