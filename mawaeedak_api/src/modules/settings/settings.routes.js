const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const { validate } = require('../../middleware/errorHandler');
const { authMiddleware, adminOnly, optionalAuth } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get all settings (public)
router.get('/', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const { group } = req.query;
    
    let query = 'SELECT * FROM settings WHERE 1=1';
    const params = [];
    
    if (group) {
      query += ' AND group_key = ?';
      params.push(group);
    }
    
    const settings = db.prepare(query).all(...params);
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    next(error);
  }
});

// Get setting by key (public)
router.get('/:key', optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const setting = db.prepare('SELECT * FROM settings WHERE `key` = ?').get(req.params.key);
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
});

// Update or create setting (Admin only)
router.put('/:key',
  authMiddleware,
  adminOnly,
  [
    body('value').notEmpty().withMessage('Value is required'),
    body('type').optional().isIn(['text', 'color', 'image', 'url', 'number', 'boolean'])
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { key } = req.params;
      const { value, type, group_key } = req.body;
      
      const existing = db.prepare('SELECT id FROM settings WHERE `key` = ?').get(key);
      
      if (existing) {
        db.prepare(`
          UPDATE settings SET value = ?, type = ?, updated_at = ? WHERE ` + '`key` = ?')
          .run(value, type || 'text', new Date().toISOString(), key);
      } else {
        const id = uuidv4();
        db.prepare(`
          INSERT INTO settings (id, ` + '`key`' + `, value, type, group_key)
          VALUES (?, ?, ?, ?, ?)
        `).run(id, key, value, type || 'text', group_key || 'general');
      }
      
      const setting = db.prepare('SELECT * FROM settings WHERE `key` = ?').get(key);
      res.json({ success: true, data: setting });
    } catch (error) {
      next(error);
    }
  }
);

// Update multiple settings (Admin only)
router.post('/bulk',
  authMiddleware,
  adminOnly,
  [
    body('settings').isArray()
  ],
  validate,
  (req, res, next) => {
    try {
      const db = getDb();
      const { settings } = req.body;
      
      const update = db.prepare(`
        UPDATE settings SET value = ?, type = COALESCE(?, type), updated_at = ? WHERE ` + '`key` = ?');
      
      settings.forEach(({ key, value, type }) => {
        update.run(value, type || null, new Date().toISOString(), key);
      });
      
      res.json({ success: true, message: `${settings.length} settings updated` });
    } catch (error) {
      next(error);
    }
  }
);

// Delete setting (Admin only)
router.delete('/:key', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { key } = req.params;
    
    const existing = db.prepare('SELECT id FROM settings WHERE `key` = ?').get(key);
    if (!existing) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    db.prepare('DELETE FROM settings WHERE `key` = ?').run(key);
    res.json({ success: true, message: 'Setting deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
