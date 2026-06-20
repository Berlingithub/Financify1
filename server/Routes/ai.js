const express = require('express');
const multer = require('multer');
const { parseReceiptImage } = require('../services/aiService');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

router.post('/receipt', (req, res, next) => {
  upload.single('receipt')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image must be smaller than 5 MB' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Receipt image is required' });
    }

    const result = await parseReceiptImage(req.file.buffer, req.file.mimetype);
    res.json(result);
  } catch (e) {
    res.status(e.statusCode || 500).json({
      message: e.message,
      fallbackRecommended: Boolean(e.fallbackRecommended),
      code: e.openAiCode || undefined,
    });
  }
});

module.exports = router;
