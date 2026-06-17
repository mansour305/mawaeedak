const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { validate } = require('../../middleware/errorHandler');
const { authMiddleware, adminOnly, optionalAuth } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get all trips
router.get('/', authMiddleware, (req, res, next) => {
  try {
    const db = getDb();
    const { status } = req.query;
    
    let query = 'SELECT * FROM trips WHERE user_id = ?';
    const params = [req.user.id];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY departure_date DESC';
    
    const trips = db.prepare(query).all(...params);
    
    // Parse checklist JSON
    const parsedTrips = trips.map(trip => ({
      ...trip,
      checklist: trip.checklist ? JSON.parse(trip.checklist) : []
    }));
    
    res.json({ success: true, data: parsedTrips });
  } catch (error) {
    next(error);
  }
});

// Get trip by ID
router.get('/:id', authMiddleware, (req, res, next) => {
  try {
    const db = getDb();
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    if (trip.user_id !== req.user.id && req.user.role !== 'role_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ 
      success: true, 
      data: {
        ...trip,
        checklist: trip.checklist ? JSON.parse(trip.checklist) : []
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create trip
router.post('/',
  authMiddleware,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('departure_date').optional().isISO8601(),
    body('destination').optional().isString()
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { title, destination, departure_date, return_date, notes, checklist } = req.body;
      
      const id = uuidv4();
      const checklistJson = checklist ? JSON.stringify(checklist) : JSON.stringify([]);
      
      db.prepare(`
        INSERT INTO trips (id, title, destination, departure_date, return_date, notes, checklist, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, destination || null, departure_date || null, return_date || null, notes || null, checklistJson, req.user.id);
      
      const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
      res.status(201).json({ 
        success: true, 
        data: {
          ...trip,
          checklist: trip.checklist ? JSON.parse(trip.checklist) : []
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update trip
router.put('/:id',
  authMiddleware,
  [
    body('title').optional().trim().isLength({ min: 1 })
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { id } = req.params;
      const { title, destination, departure_date, return_date, notes, checklist, status } = req.body;
      
      const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      
      if (existing.user_id !== req.user.id && req.user.role !== 'role_admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const updates = [];
      const params = [];
      
      if (title) { updates.push('title = ?'); params.push(title); }
      if (destination !== undefined) { updates.push('destination = ?'); params.push(destination); }
      if (departure_date !== undefined) { updates.push('departure_date = ?'); params.push(departure_date); }
      if (return_date !== undefined) { updates.push('return_date = ?'); params.push(return_date); }
      if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
      if (checklist !== undefined) { updates.push('checklist = ?'); params.push(JSON.stringify(checklist)); }
      if (status) { updates.push('status = ?'); params.push(status); }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);
      
      db.prepare(`UPDATE trips SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      
      const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
      res.json({ 
        success: true, 
        data: {
          ...trip,
          checklist: trip.checklist ? JSON.parse(trip.checklist) : []
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete trip
router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    if (existing.user_id !== req.user.id && req.user.role !== 'role_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.prepare('DELETE FROM trips WHERE id = ?').run(id);
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Update checklist item
router.patch('/:id/checklist',
  authMiddleware,
  [
    body('checklist').isArray()
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { id } = req.params;
      const { checklist } = req.body;
      
      const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      
      if (existing.user_id !== req.user.id && req.user.role !== 'role_admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      db.prepare('UPDATE trips SET checklist = ?, updated_at = ? WHERE id = ?')
        .run(JSON.stringify(checklist), new Date().toISOString(), id);
      
      const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
      res.json({ 
        success: true, 
        data: {
          ...trip,
          checklist: trip.checklist ? JSON.parse(trip.checklist) : []
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
