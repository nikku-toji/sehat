import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

app.use('/api', routes);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Sehat API listening on :${config.port}`);
  console.log(`MOCK_MODE = ${config.mockMode} (no AWS calls when true)`);
});
