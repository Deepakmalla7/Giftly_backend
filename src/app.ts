import express, { Application, Request, Response } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import bookroute from './routes/book.route';
import authRO from './routes/user.route';
import giftRoutes from './routes/gift.route';
import adminRoutes from './routes/admin/user.route';
import uploadRoutes from './routes/upload.route';
import reviewRoutes from './routes/review.route';
import cartRoutes from './routes/cart.route';
import favoriteRoutes from './routes/favorite.route';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
const settingsRoutes = require('./routes/settings.routes');

const app: Application = express();

app.use(bodyParser.json());

let corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const uploadsDir = path.resolve(__dirname, './uploads');
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req: Request, res: Response) => {
    res.send("Giftly API - Server running successfully");
});

app.get('/api/test', (req: Request, res: Response) => {
    res.json({ message: "API routes are working", timestamp: new Date() });
});

app.use('/api/auth', authRO);
app.use('/api/gifts', giftRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/books', bookroute);
app.use('/api/admin/users', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
