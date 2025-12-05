// src/server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errors } from 'celebrate';

import authRoutes from './routes/authRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import userRoutes from './routes/userRoutes.js';
 


const app = express();
const PORT = process.env.PORT ?? 3000;

// Глобальні middleware
app.use(logger);         // 1. Логер першим — бачить усі запити
app.use(express.json()); // 2. Парсинг JSON-тіла
app.use(cors());         // 3. Дозвіл для запитів з інших доменів
app.use(cookieParser()); // 4.Налаштовуємо парсер кук

// GET
app.use(authRoutes);
app.use(notesRoutes);
app.use(userRoutes);
// 404 — якщо маршрут не знайдено
app.use(notFoundHandler);

// errors з celebrate
app.use(errors);

// Middleware для обробки помилок
app.use(errorHandler);


await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
