const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { validate } = require('../../middleware/errorHandler');
const { authMiddleware, adminOnly, optionalAuth } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get all supports
router.get('/', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const { type, from_date, to_date, upcoming } = req.query;
    
    let query = 'SELECT * FROM supports WHERE is_active = 1';
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (from_date) {
      query += ' AND payment_date >= ?';
      params.push(from_date);
    }
    
    if (to_date) {
      query += ' AND payment_date <= ?';
      params.push(to_date);
    }
    
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query += ' AND payment_date >= ? ORDER BY payment_date ASC LIMIT 1';
      params.push(today);
    } else {
      query += ' ORDER BY payment_date DESC';
    }
    
    const supports = db.prepare(query).all(...params);
    
    res.json({
      success: true,
      data: supports
    });
  } catch (error) {
    next(error);
  }
});

// Get support by ID
router.get('/:id', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const support = db.prepare('SELECT * FROM supports WHERE id = ?').get(req.params.id);
    
    if (!support) {
      return res.status(404).json({ error: 'Support not found' });
    }
    
    res.json({ success: true, data: support });
  } catch (error) {
    next(error);
  }
});

// Create support (Admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('payment_date').isISO8601().withMessage('Valid payment date is required'),
    body('type').isIn(['housing', 'utility', 'citizen_account', 'education', 'health', 'other'])
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { title, amount, payment_date, type, description } = req.body;
      
      const id = uuidv4();
      db.prepare(`
        INSERT INTO supports (id, title, amount, payment_date, type, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, title, amount || null, payment_date, type, description || null);
      
      const support = db.prepare('SELECT * FROM supports WHERE id = ?').get(id);
      res.status(201).json({ success: true, data: support });
    } catch (error) {
      next(error);
    }
  }
);

// Update support (Admin only)
router.put('/:id',
  authMiddleware,
  adminOnly,
  [
    body('title').optional().trim().isLength({ min: 1 }),
    body('payment_date').optional().isISO8601(),
    body('type').optional().isIn(['housing', 'utility', 'citizen_account', 'education', 'health', 'other'])
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { id } = req.params;
      const { title, amount, payment_date, type, description } = req.body;
      
      const existing = db.prepare('SELECT id FROM supports WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Support not found' });
      }
      
      const updates = [];
      const params = [];
      
      if (title) { updates.push('title = ?'); params.push(title); }
      if (amount !== undefined) { updates.push('amount = ?'); params.push(amount); }
      if (payment_date) { updates.push('payment_date = ?'); params.push(payment_date); }
      if (type) { updates.push('type = ?'); params.push(type); }
      if (description !== undefined) { updates.push('description = ?'); params.push(description); }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);
      
      db.prepare(`UPDATE supports SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      
      const support = db.prepare('SELECT * FROM supports WHERE id = ?').get(id);
      res.json({ success: true, data: support });
    } catch (error) {
      next(error);
    }
  }
);

// Delete support (Admin only)
router.delete('/:id', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const existing = db.prepare('SELECT id FROM supports WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Support not found' });
    }
    
    db.prepare('DELETE FROM supports WHERE id = ?').run(id);
    res.json({ success: true, message: 'Support deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
