const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { validate } = require('../../middleware/errorHandler');
const { authMiddleware, adminOnly, optionalAuth } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get all calendar events
router.get('/', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const { date, start_date, end_date, category, view } = req.query;
    
    let query = 'SELECT * FROM calendar_events WHERE (is_public = 1 OR user_id = ?)';
    const params = [req.user?.id || null];
    
    if (date) {
      query += ' AND event_date = ?';
      params.push(date);
    }
    
    if (start_date) {
      query += ' AND event_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND event_date <= ?';
      params.push(end_date);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY event_date ASC, event_time ASC';
    
    const events = db.prepare(query).all(...params);
    
    // Group by date for calendar view
    if (view === 'monthly') {
      const grouped = {};
      events.forEach(event => {
        if (!grouped[event.event_date]) {
          grouped[event.event_date] = [];
        }
        grouped[event.event_date].push(event);
      });
      return res.json({ success: true, data: events, grouped });
    }
    
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
});

// Get events by view type (daily, weekly, monthly)
router.get('/view/:type', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const { type } = req.params;
    const today = new Date();
    let startDate, endDate;
    
    switch (type) {
      case 'daily':
        startDate = today.toISOString().split('T')[0];
        endDate = startDate;
        break;
      case 'weekly':
        const dayOfWeek = today.getDay();
        startDate = new Date(today.setDate(today.getDate() - dayOfWeek)).toISOString().split('T')[0];
        endDate = new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 6)).toISOString().split('T')[0];
        break;
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      default:
        return res.status(400).json({ error: 'Invalid view type' });
    }
    
    const events = db.prepare(`
      SELECT * FROM calendar_events 
      WHERE (is_public = 1 OR user_id = ?) AND event_date >= ? AND event_date <= ?
      ORDER BY event_date ASC, event_time ASC
    `).all(req.user?.id || null, startDate, endDate);
    
    res.json({ success: true, data: events, start_date: startDate, end_date: endDate });
  } catch (error) {
    next(error);
  }
});

// Get event by ID
router.get('/:id', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (!event.is_public && event.user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
});

// Create event
router.post('/',
  authMiddleware,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('event_date').isISO8601().withMessage('Valid event date is required'),
    body('category').optional().isString()
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { title, description, event_date, event_time, category, is_public } = req.body;
      
      const id = uuidv4();
      db.prepare(`
        INSERT INTO calendar_events (id, title, description, event_date, event_time, category, user_id, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, description || null, event_date, event_time || null, category || 'general', req.user.id, is_public ? 1 : 0);
      
      const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }
);

// Update event
router.put('/:id',
  authMiddleware,
  [
    body('title').optional().trim().isLength({ min: 1 }),
    body('event_date').optional().isISO8601()
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { id } = req.params;
      const { title, description, event_date, event_time, category, is_public } = req.body;
      
      const existing = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      if (existing.user_id !== req.user.id && req.user.role !== 'role_admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const updates = [];
      const params = [];
      
      if (title) { updates.push('title = ?'); params.push(title); }
      if (description !== undefined) { updates.push('description = ?'); params.push(description); }
      if (event_date) { updates.push('event_date = ?'); params.push(event_date); }
      if (event_time !== undefined) { updates.push('event_time = ?'); params.push(event_time); }
      if (category) { updates.push('category = ?'); params.push(category); }
      if (is_public !== undefined) { updates.push('is_public = ?'); params.push(is_public ? 1 : 0); }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);
      
      db.prepare(`UPDATE calendar_events SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      
      const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }
);

// Delete event
router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const existing = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (existing.user_id !== req.user.id && req.user.role !== 'role_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.prepare('DELETE FROM calendar_events WHERE id = ?').run(id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
