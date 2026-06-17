const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { validate } = require('../../middleware/errorHandler');
const { authMiddleware, adminOnly, optionalAuth } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get all news (public)
router.get('/', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const { limit, page } = req.query;
    
    let query = 'SELECT * FROM news WHERE is_active = 1 ORDER BY created_at DESC';
    const params = [];
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
      
      if (page) {
        query += ' OFFSET ?';
        params.push((parseInt(page) - 1) * parseInt(limit));
      }
    }
    
    const news = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM news WHERE is_active = 1').get().count;
    
    res.json({ success: true, data: news, total });
  } catch (error) {
    next(error);
  }
});

// Get news by ID
router.get('/:id', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const news = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
    
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    res.json({ success: true, data: news });
  } catch (error) {
    next(error);
  }
});

// Create news (Admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('content').optional().isString()
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { title, content, image_url } = req.body;
      
      const id = uuidv4();
      db.prepare(`
        INSERT INTO news (id, title, content, image_url)
        VALUES (?, ?, ?, ?)
      `).run(id, title, content || null, image_url || null);
      
      const news = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
      res.status(201).json({ success: true, data: news });
    } catch (error) {
      next(error);
    }
  }
);

// Update news (Admin only)
router.put('/:id',
  authMiddleware,
  adminOnly,
  [
    body('title').optional().trim().isLength({ min: 1 }),
    body('content').optional().isString()
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { id } = req.params;
      const { title, content, image_url, is_active } = req.body;
      
      const existing = db.prepare('SELECT id FROM news WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'News not found' });
      }
      
      const updates = [];
      const params = [];
      
      if (title) { updates.push('title = ?'); params.push(title); }
      if (content !== undefined) { updates.push('content = ?'); params.push(content); }
      if (image_url !== undefined) { updates.push('image_url = ?'); params.push(image_url); }
      if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);
      
      db.prepare(`UPDATE news SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      
      const news = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
      res.json({ success: true, data: news });
    } catch (error) {
      next(error);
    }
  }
);

// Delete news (Admin only)
router.delete('/:id', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const existing = db.prepare('SELECT id FROM news WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    db.prepare('DELETE FROM news WHERE id = ?').run(id);
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
