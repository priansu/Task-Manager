const express = require('express');
const {
  bootstrapAdmin,
  getUsers,
  loginUser,
  registerUser,
  updateUserRole,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/bootstrap-admin', bootstrapAdmin);
router.get('/users', protect, adminOnly, getUsers);
router.patch('/users/:id/role', protect, adminOnly, updateUserRole);

module.exports = router;
