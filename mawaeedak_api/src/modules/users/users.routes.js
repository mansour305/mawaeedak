const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { validate } = require('../../middleware/errorHandler');
const { authMiddleware, adminOnly } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get all users (Admin only)
router.get('/', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { page = 1, limit = 20, search, is_active } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, name, phone, email, is_active, role_id, created_at, updated_at FROM users WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const users = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authMiddleware, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    // Users can only access their own data unless admin
    if (req.user.role !== 'role_admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = db.prepare('SELECT id, name, phone, email, is_active, role_id, created_at, updated_at FROM users WHERE id = ?').get(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id',
  authMiddleware,
  [
    body('name').optional().trim().isLength({ min: 2 }),
    body('email').optional().isEmail(),
    body('phone').optional().isMobilePhone('ar-SA')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;
      
      // Users can only update their own data unless admin
      if (req.user.role !== 'role_admin' && req.user.id !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const db = getDb();
      const updates = [];
      const params = [];
      
      if (name) {
        updates.push('name = ?');
        params.push(name);
      }
      if (email !== undefined) {
        updates.push('email = ?');
        params.push(email);
      }
      if (phone) {
        updates.push('phone = ?');
        params.push(phone);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);
      
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      
      const user = db.prepare('SELECT id, name, phone, email, is_active, role_id FROM users WHERE id = ?').get(id);
      
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

// Change password
router.put('/:id/password',
  authMiddleware,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 4 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      if (req.user.role !== 'role_admin' && req.user.id !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const db = getDb();
      const user = db.prepare('SELECT password FROM users WHERE id = ?').get(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (user.password && !bcrypt.compareSync(currentPassword, user.password)) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      db.prepare('UPDATE users SET password = ?, updated_at = ? WHERE id = ?')
        .run(hashedPassword, new Date().toISOString(), id);
      
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Delete user (Admin only)
router.delete('/:id', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Toggle user active status (Admin only)
router.patch('/:id/toggle-active', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const user = db.prepare('SELECT id, is_active FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const newStatus = user.is_active ? 0 : 1;
    db.prepare('UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?')
      .run(newStatus, new Date().toISOString(), id);
    
    res.json({ success: true, is_active: newStatus });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
