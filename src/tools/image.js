import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { join } from 'path';
import { unlink, stat } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = join(__dirname, '..', '..', 'uploads');
const upload = multer({ dest: uploadDir, limits: { fileSize: 20 * 1024 * 1024 } });

export const imageRouter = Router();

imageRouter.post('/compress', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传图片文件' });
    const quality = parseInt(req.query.quality) || 80;
    const outputName = 'compressed-' + uuid() + '.webp';
    const outputPath = join(uploadDir, outputName);
    await sharp(req.file.path).webp({ quality }).toFile(outputPath);
    await unlink(req.file.path);
    const fileStat = await stat(outputPath);
    res.json({
      success: true,
      originalSize: req.file.size,
      compressedSize: fileStat.size,
      ratio: ((1 - fileStat.size / req.file.size) * 100).toFixed(1) + '%',
      downloadUrl: '/download/' + outputName
    });
  } catch (err) { next(err); }
});

imageRouter.post('/convert', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传图片文件' });
    const format = req.query.format || 'webp';
    const outputName = 'converted-' + uuid() + '.' + format;
    const outputPath = join(uploadDir, outputName);
    await sharp(req.file.path).toFormat(format).toFile(outputPath);
    await unlink(req.file.path);
    res.json({ success: true, format, downloadUrl: '/download/' + outputName });
  } catch (err) { next(err); }
});

imageRouter.post('/resize', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传图片文件' });
    const width = parseInt(req.query.width) || 800;
    const outputName = 'resized-' + uuid() + '.webp';
    const outputPath = join(uploadDir, outputName);
    await sharp(req.file.path).resize(width).webp().toFile(outputPath);
    await unlink(req.file.path);
    res.json({ success: true, width, downloadUrl: '/download/' + outputName });
  } catch (err) { next(err); }
});