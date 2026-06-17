const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../../middleware/auth');
const { getDb } = require('../../database/models');

// Get dashboard statistics (Admin only)
router.get('/stats', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalAdmins = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
    const activeUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get().count;
    const totalSalaries = db.prepare('SELECT COUNT(*) as count FROM salaries WHERE is_active = 1').get().count;
    const totalSupports = db.prepare('SELECT COUNT(*) as count FROM supports WHERE is_active = 1').get().count;
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM calendar_events').get().count;
    const totalServices = db.prepare('SELECT COUNT(*) as count FROM services WHERE is_active = 1').get().count;
    const totalTrips = db.prepare('SELECT COUNT(*) as count FROM trips').get().count;
    const totalNews = db.prepare('SELECT COUNT(*) as count FROM news WHERE is_active = 1').get().count;
    const totalJobs = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE is_active = 1').get().count;
    const totalNotifications = db.prepare('SELECT COUNT(*) as count FROM notifications').get().count;
    
    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        admins: {
          total: totalAdmins
        },
        salaries: {
          total: totalSalaries
        },
        supports: {
          total: totalSupports
        },
        calendar_events: {
          total: totalEvents
        },
        services: {
          total: totalServices
        },
        trips: {
          total: totalTrips
        },
        news: {
          total: totalNews
        },
        jobs: {
          total: totalJobs
        },
        notifications: {
          total: totalNotifications
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get recent activities
router.get('/activities', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const { limit = 20 } = req.query;
    
    const activities = db.prepare(`
      SELECT * FROM logs 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(parseInt(limit));
    
    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
});

// Get upcoming events chart data
router.get('/charts/upcoming', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    // Get salary payments in the next 30 days
    const salaryPayments = db.prepare(`
      SELECT payment_date, title, amount, 'salary' as type
      FROM salaries 
      WHERE payment_date >= ? AND payment_date <= date(?, '+30 days') AND is_active = 1
      ORDER BY payment_date ASC
    `).all(today.toISOString().split('T')[0], nextMonth.toISOString().split('T')[0]);
    
    // Get support payments in the next 30 days
    const supportPayments = db.prepare(`
      SELECT payment_date, title, amount, type
      FROM supports 
      WHERE payment_date >= ? AND payment_date <= date(?, '+30 days') AND is_active = 1
      ORDER BY payment_date ASC
    `).all(today.toISOString().split('T')[0], nextMonth.toISOString().split('T')[0]);
    
    // Get calendar events in the next 30 days
    const calendarEvents = db.prepare(`
      SELECT event_date as payment_date, title, NULL as amount, 'event' as type
      FROM calendar_events 
      WHERE event_date >= ? AND event_date <= date(?, '+30 days')
      ORDER BY event_date ASC
    `).all(today.toISOString().split('T')[0], nextMonth.toISOString().split('T')[0]);
    
    const combined = [...salaryPayments, ...supportPayments, ...calendarEvents]
      .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));
    
    res.json({ success: true, data: combined });
  } catch (error) {
    next(error);
  }
});

// Get monthly summary
router.get('/monthly-summary', authMiddleware, adminOnly, (req, res, next) => {
  try {
    const db = getDb();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const newUsersThisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= ? AND created_at <= ?
    `).get(firstDayOfMonth, lastDayOfMonth + ' 23:59:59').count;
    
    const newSalaries = db.prepare(`
      SELECT COUNT(*) as count FROM salaries 
      WHERE created_at >= ? AND created_at <= ?
    `).get(firstDayOfMonth, lastDayOfMonth + ' 23:59:59').count;
    
    const newSupports = db.prepare(`
      SELECT COUNT(*) as count FROM supports 
      WHERE created_at >= ? AND created_at <= ?
    `).get(firstDayOfMonth, lastDayOfMonth + ' 23:59:59').count;
    
    const totalPaymentsThisMonth = db.prepare(`
      SELECT SUM(amount) as total FROM (
        SELECT amount FROM salaries WHERE payment_date >= ? AND payment_date <= ?
        UNION ALL
        SELECT amount FROM supports WHERE payment_date >= ? AND payment_date <= ?
      )
    `).get(firstDayOfMonth, lastDayOfMonth, firstDayOfMonth, lastDayOfMonth).total || 0;
    
    res.json({
      success: true,
      data: {
        new_users: newUsersThisMonth,
        new_salaries: newSalaries,
        new_supports: newSupports,
        total_payments: totalPaymentsThisMonth
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
