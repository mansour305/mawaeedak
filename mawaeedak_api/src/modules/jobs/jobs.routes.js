const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { validate } = require('../../middleware/errorHandler');
const { authMiddleware, adminOnly, optionalAuth } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get all jobs (public)
router.get('/', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const { location, is_active } = req.query;
    
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    } else {
      query += ' AND is_active = 1';
    }
    
    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const jobs = db.prepare(query).all(...params);
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
});

// Get job by ID
router.get('/:id', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

// Create job (Admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('company').optional().isString(),
    body('location').optional().isString()
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { title, company, location, description, requirements, salary_range } = req.body;
      
      const id = uuidv4();
      db.prepare(`
        INSERT INTO jobs (id, title, company, location, description, requirements, salary_range)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, company || null, location || null, description || null, requirements || null, salary_range || null);
      
      const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
      res.status(201).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }
);

// Update job (Admin only)
router.put('/:id',
  authMiddleware,
  adminOnly,
  [
    body('title').optional().trim().isLength({ min: 1 })
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { id } = req.params;
      const { title, company, location, description, requirements, salary_range, is_active } = req.body;
      
      const existing = db.prepare('SELECT id FROM jobs WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      const updates = [];
      const params = [];
      
      if (title) { updates.push('title = ?'); params.push(title); }
      if (company !== undefined) { updates.push('company = ?'); params.push(company); }
      if (location !== undefined) { updates.push('location = ?'); params.push(location); }
      if (description !== undefined) { updates.push('description = ?'); params.push(description); }
      if (requirements !== undefined) { updates.push('requirements = ?'); params.push(requirements); }
      if (salary_range !== undefined) { updates.push('salary_range = ?'); params.push(salary_range); }
      if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);
      
      db.prepare(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      
      const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }
);

// Delete job (Admin only)
router.delete('/:id', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const existing = db.prepare('SELECT id FROM jobs WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
