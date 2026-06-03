const API_KEY = 'sk-1d37394180f04693ac39d7e35317ed90';
const ADMIN_PASSWORD = 'admin123';

// In-memory log store (persists between warm function calls)
let chatLogs = [];

export default async function handler(req, res) {
  const { path, method } = req;

  // Chat API
  if (path.endsWith('/api/chat') && method === 'POST') {
    const { messages } = req.body;
    if (!messages) return res.status(400).json({ error: 'messages required' });

    const userMsg = messages[messages.length - 1].content;

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是视觉便签公众号的AI助手。视觉便签是专注原创微信红包封面设计的团队公众号。用中文回复，亲切友好。公众号名称：视觉便签，微信号：hebuter00409。' },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '抱歉，暂时无法回复。';

      chatLogs.push({
        time: new Date().toISOString(),
        user: userMsg,
        bot: reply,
      });

      // Keep only last 500 entries
      if (chatLogs.length > 500) chatLogs = chatLogs.slice(-500);

      return res.json({ reply });
    } catch {
      return res.status(500).json({ error: 'API error' });
    }
  }

  // Admin logs API
  if (path.endsWith('/api/logs') && method === 'GET') {
    if (req.query.pwd !== ADMIN_PASSWORD) {
      return res.status(401).send('密码错误');
    }
    return res.json(chatLogs);
  }

  // Admin page
  if (path.endsWith('/admin')) {
    return res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>聊天记录 - 视觉便签</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;background:#f5f5f5;padding:16px}
.container{max-width:800px;margin:0 auto}
h1{text-align:center;color:#1a1a2e;margin:20px 0}
.login{background:#fff;padding:40px;border-radius:12px;text-align:center;max-width:360px;margin:80px auto;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.login input{width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:16px;margin-bottom:12px}
.login button{width:100%;padding:12px;background:#07C160;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer}
.day{background:#fff;border-radius:12px;margin-bottom:16px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.04)}
.day__header{background:#07C160;color:#fff;padding:12px 16px;font-weight:700;font-size:14px}
.msg{padding:12px 16px;border-bottom:1px solid #f0f0f0}
.msg:last-child{border-bottom:none}
.msg__time{font-size:11px;color:#999;margin-bottom:4px}
.msg__label{font-size:11px;font-weight:700;margin-bottom:4px;display:inline-block;padding:1px 8px;border-radius:4px}
.msg__label--user{background:#e8f8ef;color:#07C160}
.msg__label--bot{background:#f0f0f0;color:#666}
.msg__text{font-size:14px;line-height:1.6;color:#333;white-space:pre-wrap}
.empty{text-align:center;padding:60px 20px;color:#999}
.logout{text-align:center;margin-bottom:16px}
.logout button{background:none;border:1px solid #ddd;padding:6px 16px;border-radius:6px;color:#666;cursor:pointer;font-size:13px}
</style></head>
<body><div class="container" id="app"></div>
<script>
let pwd=localStorage.getItem('ap')||'';
async function r(){
  const a=document.getElementById('app');
  if(!pwd){a.innerHTML='<div class="login"><h2 style="margin-bottom:20px">'+unescape('%F0%9F%94%90')+' 管理员登录</h2><input id="pw" type="password" placeholder="请输入管理密码" /><button onclick="l()">进入</button></div>';return}
  try{const r=await fetch('/api/logs?pwd='+encodeURIComponent(pwd));if(!r.ok){pwd='';localStorage.removeItem('ap');r();return}
  const d=await r.json();
  if(!d.length){a.innerHTML='<h1>'+unescape('%F0%9F%93%8B')+' 聊天记录</h1><div class="logout"><button onclick="lo()">退出</button></div><div class="empty"><p style="font-size:40px;margin-bottom:12px">'+unescape('%F0%9F%93%AD')+'</p><p>暂无聊天记录</p></div>';return}
  let h='<h1>'+unescape('%F0%9F%93%8B')+' 聊天记录</h1><div class="logout"><button onclick="lo()">退出</button></div>';
  for(const e of d){h+='<div class="day"><div class="day__header">'+new Date(e.time).toLocaleString('zh-CN')+'</div><div class="msg"><div class="msg__label msg__label--user">'+unescape('%F0%9F%91%A4')+' 用户</div><div class="msg__text">'+e.user.replace(/</g,'&lt;')+'</div><div class="msg__label msg__label--bot" style="margin-top:8px">'+unescape('%F0%9F%A4%96')+' AI</div><div class="msg__text">'+e.bot.replace(/</g,'&lt;')+'</div></div></div>'}
  a.innerHTML=h}catch{pwd='';localStorage.removeItem('ap');r()}}
function l(){pwd=document.getElementById('pw').value;localStorage.setItem('ap',pwd);r()}
function lo(){pwd='';localStorage.removeItem('ap');r()}
r();
</script></body></html>`);
  }

  // 404
  res.status(404).send('Not found');
}
