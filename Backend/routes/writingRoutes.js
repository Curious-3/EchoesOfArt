// routes/writingRoutes.js
import express from 'express';
import { saveWriting, getUserWritings } from '../controllers/writingController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

// Save or update a writing
router.post('/save', protect, saveWriting);

// Get user's writings
router.get('/my-writings', protect, getUserWritings);

//  Export router as default
export default router;
