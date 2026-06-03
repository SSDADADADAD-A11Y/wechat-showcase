const API_KEY = 'sk-1d37394180f04693ac39d7e35317ed90';
const ADMIN_PASSWORD = 'admin123';

let chatLogs = [];

export default async (req) => {
  // req is a standard Request (web API) in Netlify Functions v2
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Chat API
  if (path === '/api/chat' && method === 'POST') {
    try {
      const body = await req.json();
      const { messages } = body;
      if (!messages) return new Response(JSON.stringify({ error: 'messages required' }), { status: 400, headers });

      const userMsg = messages[messages.length - 1].content;

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
      if (chatLogs.length > 500) chatLogs = chatLogs.slice(-500);

      return new Response(JSON.stringify({ reply }), { status: 200, headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'API error', detail: err.message }), { status: 500, headers });
    }
  }

  // Admin logs API
  if (path === '/api/logs' && method === 'GET') {
    const pwd = url.searchParams.get('pwd');
    if (pwd !== ADMIN_PASSWORD) {
      return new Response('密码错误', { status: 401, headers: { 'Content-Type': 'text/plain' } });
    }
    return new Response(JSON.stringify(chatLogs), { status: 200, headers });
  }

  // Admin page
  if (path === '/admin') {
    const html = `<!DOCTYPE html>
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
.entry{background:#fff;border-radius:12px;margin-bottom:16px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.04)}
.entry__header{background:#07C160;color:#fff;padding:10px 16px;font-size:13px}
.msg{padding:12px 16px;border-bottom:1px solid #f0f0f0}
.msg:last-child{border-bottom:none}
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
  if(!pwd){a.innerHTML='<div class="login"><h2 style="margin-bottom:20px">\\u{1F510} \\u7BA1\\u7406\\u5458\\u767B\\u5F55</h2><input id="pw" type="password" placeholder="\\u8BF7\\u8F93\\u5165\\u7BA1\\u7406\\u5BC6\\u7801" /><button onclick="l()">\\u8FDB\\u5165</button></div>';return}
  try{const r=await fetch('/api/logs?pwd='+encodeURIComponent(pwd));if(!r.ok){pwd='';localStorage.removeItem('ap');r();return}
  const d=await r.json();
  if(!d.length){a.innerHTML='<h1>\\u{1F4CB} \\u804A\\u5929\\u8BB0\\u5F55</h1><div class="logout"><button onclick="lo()">\\u9000\\u51FA</button></div><div class="empty"><p style="font-size:40px;margin-bottom:12px">\\u{1F4ED}</p><p>\\u6682\\u65E0\\u804A\\u5929\\u8BB0\\u5F55</p></div>';return}
  let h='<h1>\\u{1F4CB} \\u804A\\u5929\\u8BB0\\u5F55</h1><div class="logout"><button onclick="lo()">\\u9000\\u51FA</button></div>';
  for(const e of d){h+='<div class="entry"><div class="entry__header">'+new Date(e.time).toLocaleString('zh-CN')+'</div><div class="msg"><div class="msg__label msg__label--user">\\u{1F464} \\u7528\\u6237</div><div class="msg__text">'+e.user.replace(/</g,'&lt;')+'</div><div class="msg__label msg__label--bot" style="margin-top:8px">\\u{1F916} AI</div><div class="msg__text">'+e.bot.replace(/</g,'&lt;')+'</div></div></div>'}
  a.innerHTML=h}catch{pwd='';localStorage.removeItem('ap');r()}}
function l(){pwd=document.getElementById('pw').value;localStorage.setItem('ap',pwd);r()}
function lo(){pwd='';localStorage.removeItem('ap');r()}
r();
</script></body></html>`;
    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // 404
  return new Response('Not found', { status: 404 });
};
