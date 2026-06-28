import { Router } from 'express';
export const textRouter = Router();

textRouter.post('/count', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: '请提供文本内容' });
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const lineCount = text.split('\n').length;
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const paragraphCount = Math.max(text.split('\n\n').filter(p => p.trim()).length, 1);
  res.json({ success: true, data: { charCount, wordCount, lineCount, chineseChars, englishWords, paragraphCount } });
});

textRouter.post('/format', (req, res) => {
  const { text, action } = req.body;
  if (!text) return res.status(400).json({ error: '请提供文本内容' });
  let result = text;
  try {
    switch (action) {
      case 'trim': result = text.split('\n').map(l => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n'); break;
      case 'remove-spaces': result = text.replace(/\s+/g, ''); break;
      case 'to-upper': result = text.toUpperCase(); break;
      case 'to-lower': result = text.toLowerCase(); break;
      case 'reverse-lines': result = text.split('\n').reverse().join('\n'); break;
      default: return res.status(400).json({ error: '未知操作' });
    }
    res.json({ success: true, data: { original: text.length, result: result.length, result } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

textRouter.post('/base64', (req, res) => {
  const { text, action } = req.body;
  if (!text) return res.status(400).json({ error: '请提供内容' });
  try {
    const result = action === 'decode'
      ? Buffer.from(text, 'base64').toString('utf8')
      : Buffer.from(text, 'utf8').toString('base64');
    res.json({ success: true, data: { action: action || 'encode', result } });
  } catch (e) {
    res.status(400).json({ error: 'Base64解码失败: ' + e.message });
  }
});