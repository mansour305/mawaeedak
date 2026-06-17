const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { validate } = require('../../middleware/errorHandler');
const { authMiddleware, adminOnly, optionalAuth } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get all services (public)
router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const { type } = req.query;
    
    let query = 'SELECT * FROM services WHERE is_active = 1';
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY order_index ASC';
    
    const services = db.prepare(query).all(...params);
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
});

// Get service by ID
router.get('/:id', (req, res, next) => {
  try {
    const db = getDb();
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
});

// Create service (Admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('type').isIn(['add_appointment', 'trips', 'contact', 'news', 'jobs', 'other'])
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { title, description, icon, type, link, order_index } = req.body;
      
      const id = uuidv4();
      db.prepare(`
        INSERT INTO services (id, title, description, icon, type, link, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, description || null, icon || null, type, link || null, order_index || 0);
      
      const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
      res.status(201).json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  }
);

// Update service (Admin only)
router.put('/:id',
  authMiddleware,
  adminOnly,
  [
    body('title').optional().trim().isLength({ min: 1 }),
    body('type').optional().isIn(['add_appointment', 'trips', 'contact', 'news', 'jobs', 'other'])
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { id } = req.params;
      const { title, description, icon, type, link, order_index, is_active } = req.body;
      
      const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      const updates = [];
      const params = [];
      
      if (title) { updates.push('title = ?'); params.push(title); }
      if (description !== undefined) { updates.push('description = ?'); params.push(description); }
      if (icon !== undefined) { updates.push('icon = ?'); params.push(icon); }
      if (type) { updates.push('type = ?'); params.push(type); }
      if (link !== undefined) { updates.push('link = ?'); params.push(link); }
      if (order_index !== undefined) { updates.push('order_index = ?'); params.push(order_index); }
      if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);
      
      db.prepare(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      
      const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
      res.json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  }
);

// Delete service (Admin only)
router.delete('/:id', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
