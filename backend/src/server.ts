import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';

const app = express();

connectDB();

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200'
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', blogRoutes);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
}

export default app;