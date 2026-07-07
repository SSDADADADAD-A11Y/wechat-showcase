import { ArrowRight, Database, ReceiptText, Smartphone } from 'lucide-react';
import './LedgerEntry.css';

const highlights = [
  { icon: ReceiptText, text: '收入支出快速记录' },
  { icon: Database, text: '数据保存在本机浏览器' },
  { icon: Smartphone, text: '适合手机添加到主屏幕' },
];

export default function LedgerEntry() {
  return (
    <section className="ledger-entry" id="ledger">
      <div className="container ledger-entry__inner">
        <div className="ledger-entry__content">
          <span className="ledger-entry__eyebrow">New Agent</span>
          <h2>记账智能体也接入网站了</h2>
          <p>
            一个轻量、本地优先的记账助手。可以单独打开使用，适合记录日常收入、支出和消费备注。
            目前数据保存在访问者自己的设备里，不会上传到服务器。
          </p>
          <div className="ledger-entry__features">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.text}>
                  <Icon size={16} aria-hidden="true" />
                  {item.text}
                </span>
              );
            })}
          </div>
          <a className="ledger-entry__button" href="/ledger/">
            打开记账智能体
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>

        <a className="ledger-entry__mockup" href="/ledger/" aria-label="打开记账智能体">
          <div className="ledger-entry__screen">
            <div className="ledger-entry__screen-top">
              <span />
              <strong>LedgerPilot</strong>
            </div>
            <div className="ledger-entry__balance">
              <small>本月结余</small>
              <strong>¥ 3,286</strong>
            </div>
            <div className="ledger-entry__bars">
              <span style={{ '--h': '72%' }} />
              <span style={{ '--h': '44%' }} />
              <span style={{ '--h': '62%' }} />
              <span style={{ '--h': '36%' }} />
              <span style={{ '--h': '84%' }} />
            </div>
            <div className="ledger-entry__list">
              <span>餐饮 · ¥ 38</span>
              <span>交通 · ¥ 6</span>
              <span>红包封面 · ¥ 12</span>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
