// Main Router - Combines all routes
import { Router } from 'express';
import authRoutes from './user.route'; // Will rename to auth.routes.ts
import giftRoutes from './gift.route';
import uploadRoutes from './upload.route';
// import bookRoutes from './book.route'; // Uncomment if needed

const router = Router();

/**
 * API Routes Structure:
 * 
 * /api/auth       - Authentication (login, register, logout)
 * /api/users      - User operations (profile, update, delete)
 * /api/gifts      - Gift management
 * /api/uploads    - File uploads
 * /api/books      - Book management (if needed)
 */

// Mount routes
router.use('/auth', authRoutes);     // Auth routes (login, register)
router.use('/gifts', giftRoutes);    // Gift routes
router.use('/uploads', uploadRoutes); // Upload routes
// router.use('/books', bookRoutes);  // Uncomment if needed

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
