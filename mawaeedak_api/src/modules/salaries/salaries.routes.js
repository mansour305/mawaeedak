const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { validate } = require('../../middleware/errorHandler');
const { authMiddleware, adminOnly, optionalAuth } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get all salaries (public for app, full for admin)
router.get('/', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const { type, from_date, to_date, upcoming } = req.query;
    
    let query = 'SELECT * FROM salaries WHERE is_active = 1';
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
    
    const salaries = db.prepare(query).all(...params);
    
    // Get nearest payment date
    const nearest = db.prepare(`
      SELECT * FROM salaries 
      WHERE is_active = 1 AND payment_date >= date('now')
      ORDER BY payment_date ASC LIMIT 1
    `).get();
    
    res.json({
      success: true,
      data: salaries,
      nearest: nearest || null
    });
  } catch (error) {
    next(error);
  }
});

// Get salary by ID
router.get('/:id', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const salary = db.prepare('SELECT * FROM salaries WHERE id = ?').get(req.params.id);
    
    if (!salary) {
      return res.status(404).json({ error: 'Salary not found' });
    }
    
    res.json({ success: true, data: salary });
  } catch (error) {
    next(error);
  }
});

// Create salary (Admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('payment_date').isISO8601().withMessage('Valid payment date is required'),
    body('amount').optional().isNumeric(),
    body('type').optional().isIn(['salary', 'bonus', 'allowance'])
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { title, amount, payment_date, type, description } = req.body;
      
      const id = uuidv4();
      db.prepare(`
        INSERT INTO salaries (id, title, amount, payment_date, type, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, title, amount || null, payment_date, type || 'salary', description || null);
      
      const salary = db.prepare('SELECT * FROM salaries WHERE id = ?').get(id);
      res.status(201).json({ success: true, data: salary });
    } catch (error) {
      next(error);
    }
  }
);

// Update salary (Admin only)
router.put('/:id',
  authMiddleware,
  adminOnly,
  [
    body('title').optional().trim().isLength({ min: 1 }),
    body('payment_date').optional().isISO8601(),
    body('amount').optional().isNumeric(),
    body('type').optional().isIn(['salary', 'bonus', 'allowance'])
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { id } = req.params;
      const { title, amount, payment_date, type, description } = req.body;
      
      const existing = db.prepare('SELECT id FROM salaries WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Salary not found' });
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
      
      db.prepare(`UPDATE salaries SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      
      const salary = db.prepare('SELECT * FROM salaries WHERE id = ?').get(id);
      res.json({ success: true, data: salary });
    } catch (error) {
      next(error);
    }
  }
);

// Delete salary (Admin only)
router.delete('/:id', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const existing = db.prepare('SELECT id FROM salaries WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Salary not found' });
    }
    
    db.prepare('DELETE FROM salaries WHERE id = ?').run(id);
    res.json({ success: true, message: 'Salary deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get nearest payment
router.get('/nearest/next', (req, res, next) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    
    // Get nearest salary
    const nearestSalary = db.prepare(`
      SELECT * FROM salaries 
      WHERE is_active = 1 AND payment_date >= ?
      ORDER BY payment_date ASC LIMIT 1
    `).get(today);
    
    // Get nearest support
    const nearestSupport = db.prepare(`
      SELECT * FROM supports 
      WHERE is_active = 1 AND payment_date >= ?
      ORDER BY payment_date ASC LIMIT 1
    `).get(today);
    
    let nearest = null;
    if (nearestSalary && nearestSupport) {
      nearest = new Date(nearestSalary.payment_date) <= new Date(nearestSupport.payment_date) 
        ? nearestSalary 
        : nearestSupport;
    } else {
      nearest = nearestSalary || nearestSupport;
    }
    
    let daysRemaining = null;
    if (nearest) {
      const todayDate = new Date();
      const paymentDate = new Date(nearest.payment_date);
      daysRemaining = Math.ceil((paymentDate - todayDate) / (1000 * 60 * 60 * 24));
    }
    
    res.json({
      success: true,
      data: nearest,
      days_remaining: daysRemaining
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
