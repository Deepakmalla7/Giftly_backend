import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PORT } from './config';
import { connectDB } from './database/mongodb';
import userRoutes from './routes/user.route';
const app: Application = express();

connectDB();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

});

export default app;
