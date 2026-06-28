import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { imageRouter } from './tools/image.js';
import { textRouter } from './tools/text.js';
import { downloadRouter } from './routes/download.js';
import { apiKeyAuth } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimit.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(join(__dirname, '..', 'public')));

app.use('/api/v1/image', rateLimiter(10, 60), imageRouter);
app.use('/api/v1/text', rateLimiter(20, 60), textRouter);
app.use('/api/v2', apiKeyAuth);
app.use('/download', downloadRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.get('/', (req, res) => {
  res.json({
    name: 'All-in-One Toolbox API',
    version: '1.0.0',
    freeEndpoints: {
      imageCompress: 'POST /api/v1/image/compress',
      imageConvert: 'POST /api/v1/image/convert',
      imageResize: 'POST /api/v1/image/resize',
      textCount: 'POST /api/v1/text/count',
      textFormat: 'POST /api/v1/text/format',
      textBase64: 'POST /api/v1/text/base64'
    },
    paidEndpoints: {
      note: '\u9700\u8981 x-api-key \u8bf7\u6c42\u5934',
      contact: '\u8054\u7cfb\u7ba1\u7406\u5458\u83b7\u53d6 API Key'
    }
  });
});

app.use((req, res) => res.status(404).json({ error: '\u63a5\u53e3\u4e0d\u5b58\u5728' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || '\u670d\u52a1\u5668\u5185\u90e8\u9519\u8bef' });
});

app.listen(PORT, () => {
  console.log('Toolbox API running on port ' + PORT);
});