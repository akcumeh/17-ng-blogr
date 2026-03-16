import express from 'express';
const router = express.Router();
import { signup, signin, getMe } from '../controllers/authController';
import auth from '../middleware/auth';

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', auth, getMe);

export default router;