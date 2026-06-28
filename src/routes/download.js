import { Router } from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = join(__dirname, '..', '..', 'uploads');
export const downloadRouter = Router();
downloadRouter.get('/:filename', (req, res) => {
  const filePath = join(uploadDir, req.params.filename);
  res.download(filePath, (err) => { if (err) res.status(404).json({ error: '文件不存在或已过期' }); });
});
