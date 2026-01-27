import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller.js';

import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);

export default router;
