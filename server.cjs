const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = 'sk-1d37394180f04693ac39d7e35317ed90';
const ADMIN_PASSWORD = 'admin123';

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Ensure logs directory
const LOGS_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR);

// Get today's log file
function getLogFile() {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(LOGS_DIR, `chat-${date}.json`);
}

// Read existing logs
function readLogs() {
  const file = getLogFile();
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return [];
}

// Write log
function writeLog(entry) {
  const logs = readLogs();
  logs.push(entry);
  fs.writeFileSync(getLogFile(), JSON.stringify(logs, null, 2), 'utf-8');
}

// Chat API
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages required' });
  }

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
          {
            role: 'system',
            content: `你是视觉便签公众号的AI助手。视觉便签是专注原创微信红包封面设计的团队公众号。用中文回复，亲切友好。公众号名称：视觉便签，微信号：hebuter00409。`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，暂时无法回复。';

    // Log the conversation
    writeLog({
      time: new Date().toISOString(),
      user: userMsg,
      bot: reply,
    });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'API error' });
  }
});

// Admin - view logs
app.get('/api/logs', (req, res) => {
  const { pwd } = req.query;
  if (pwd !== ADMIN_PASSWORD) {
    return res.status(401).send('密码错误');
  }

  const logFiles = fs.readdirSync(LOGS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  const allLogs = [];
  for (const file of logFiles) {
    const date = file.replace('chat-', '').replace('.json', '');
    const entries = JSON.parse(fs.readFileSync(path.join(LOGS_DIR, file), 'utf-8'));
    allLogs.push({ date, entries });
  }

  res.json(allLogs);
});

// Admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback to frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
});
