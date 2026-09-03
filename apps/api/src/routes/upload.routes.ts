import { Router } from 'express';
import {
  getPresignedUrl,
  handleSimulatedUpload,
} from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Retrieve simulated upload URL (Admin / Manager / Customer)
router.post('/', authenticate, getPresignedUrl);

// Upload destination for frontends
router.put('/local-target', handleSimulatedUpload);

export default router;
