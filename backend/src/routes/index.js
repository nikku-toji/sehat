import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { analyzeReport } from '../controllers/reports.controller.js';
import { devLogin } from '../controllers/auth.controller.js';

const router = Router();

// In-memory upload; 10 MB cap; PDFs and images only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['application/pdf', 'image/png', 'image/jpeg'].includes(file.mimetype);
    cb(ok ? null : new Error('Only PDF, PNG or JPEG reports are allowed'), ok);
  },
});

router.get('/health', (req, res) => res.json({ ok: true }));
router.post('/auth/dev-login', devLogin);
router.post('/reports', requireAuth, upload.single('file'), analyzeReport);

export default router;
