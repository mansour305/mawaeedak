const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { validate } = require('../../middleware/errorHandler');
const { authMiddleware, adminOnly, optionalAuth } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get user's notifications
router.get('/', authMiddleware, (req, res, next) => {
  try {
    const db = getDb();
    const { unread_only, limit } = req.query;
    
    let query = 'SELECT * FROM notifications WHERE (target_type = ? OR target_type = ? OR user_id = ?)';
    const params = ['all', req.user.type, req.user.id];
    
    if (unread_only === 'true') {
      query += ' AND is_read = 0';
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }
    
    const notifications = db.prepare(query).all(...params);
    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE (target_type = ? OR target_type = ? OR user_id = ?) AND is_read = 0
    `).get('all', req.user.type, req.user.id);
    
    res.json({ 
      success: true, 
      data: notifications,
      unread_count: unreadCount.count
    });
  } catch (error) {
    next(error);
  }
});

// Get notification by ID
router.get('/:id', authMiddleware, (req, res, next) => {
  try {
    const db = getDb();
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notification.user_id && notification.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// Send notification (Admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('body').optional().isString(),
    body('target_type').isIn(['all', 'users', 'admins', 'user']).withMessage('Invalid target type'),
    body('type').optional().isIn(['general', 'salary', 'support', 'trip', 'news', 'job'])
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { title, body, type, target_type, target_id } = req.body;
      
      if (target_type === 'all' || target_type === 'users' || target_type === 'admins') {
        // Create notification for each target
        const users = target_type === 'all' 
          ? db.prepare('SELECT id FROM users UNION SELECT id FROM admins').all()
          : db.prepare(`SELECT id FROM ${target_type}`).all();
        
        const insert = db.prepare(`
          INSERT INTO notifications (id, title, body, type, target_type, target_id, user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const notifications = [];
        users.forEach(user => {
          const id = uuidv4();
          insert.run(id, title, body || null, type || 'general', target_type, target_id || null, user.id);
          notifications.push(id);
        });
        
        res.status(201).json({ success: true, message: `Sent to ${notifications.length} recipients`, count: notifications.length });
      } else {
        // Single user notification
        const id = uuidv4();
        db.prepare(`
          INSERT INTO notifications (id, title, body, type, target_type, target_id, user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, title, body || null, type || 'general', target_type, target_id, target_id);
        
        res.status(201).json({ success: true, notification_id: id });
      }
    } catch (error) {
      next(error);
    }
  }
);

// Mark as read
router.patch('/:id/read', authMiddleware, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notification.user_id && notification.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.patch('/read-all', authMiddleware, (req, res, next) => {
  try {
    const db = getDb();
    
    db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE (target_type = ? OR target_type = ? OR user_id = ?) AND is_read = 0
    `).run('all', req.user.type, req.user.id);
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notification.user_id !== req.user.id && req.user.role !== 'role_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
});

// Get notification history (Admin)
router.get('/admin/history', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { limit = 50, offset = 0 } = req.query;
    
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), parseInt(offset));
    
    const total = db.prepare('SELECT COUNT(*) as count FROM notifications').get().count;
    
    res.json({ success: true, data: notifications, total });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
