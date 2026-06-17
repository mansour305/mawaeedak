const Database = require('better-sqlite3');
const path = require('path');
const config = require('../../config');

let db = null;

function getDb() {
  if (!db) {
    db = new Database(config.database.path);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function initializeDatabase() {
  const database = getDb();
  
  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT NOT NULL,
      password TEXT,
      is_guest INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      role_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admins table
  database.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Roles table
  database.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Permissions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      module TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Role permissions junction table
  database.exec(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      id TEXT PRIMARY KEY,
      role_id TEXT,
      permission_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (permission_id) REFERENCES permissions(id)
    )
  `);

  // Salaries table
  database.exec(`
    CREATE TABLE IF NOT EXISTS salaries (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount REAL,
      payment_date TEXT NOT NULL,
      type TEXT DEFAULT 'salary',
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Supports table
  database.exec(`
    CREATE TABLE IF NOT EXISTS supports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount REAL,
      payment_date TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Calendar events table
  database.exec(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      event_time TEXT,
      category TEXT,
      user_id TEXT,
      is_public INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Services table
  database.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      type TEXT NOT NULL,
      link TEXT,
      is_active INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Trips table
  database.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      destination TEXT,
      departure_date TEXT,
      return_date TEXT,
      status TEXT DEFAULT 'planned',
      user_id TEXT,
      notes TEXT,
      checklist TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notifications table
  database.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT,
      type TEXT DEFAULT 'general',
      target_type TEXT DEFAULT 'all',
      target_id TEXT,
      is_read INTEGER DEFAULT 0,
      user_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // News table
  database.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Jobs table
  database.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT,
      location TEXT,
      description TEXT,
      requirements TEXT,
      salary_range TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT,
      type TEXT DEFAULT 'text',
      group_key TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Logs table
  database.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      action TEXT,
      user_id TEXT,
      admin_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Refresh tokens table
  database.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      admin_id TEXT,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed initial data
  seedDatabase(database);
  
  console.log('✅ Database initialized successfully');
}

function seedDatabase(database) {
  const existingSettings = database.prepare('SELECT COUNT(*) as count FROM settings').get();
  
  if (existingSettings.count === 0) {
    // Seed roles
    const roles = [
      { id: 'role_admin', name: 'Admin', description: 'System Administrator' },
      { id: 'role_manager', name: 'Manager', description: 'Content Manager' },
      { id: 'role_user', name: 'User', description: 'Regular User' }
    ];
    
    const insertRole = database.prepare('INSERT INTO roles (id, name, description) VALUES (?, ?, ?)');
    roles.forEach(role => insertRole.run(role.id, role.name, role.description));
    
    // Seed permissions
    const permissions = [
      { id: 'perm_users', name: 'manage_users', description: 'Manage Users', module: 'users' },
      { id: 'perm_salaries', name: 'manage_salaries', description: 'Manage Salaries', module: 'salaries' },
      { id: 'perm_supports', name: 'manage_supports', description: 'Manage Supports', module: 'supports' },
      { id: 'perm_calendar', name: 'manage_calendar', description: 'Manage Calendar', module: 'calendar' },
      { id: 'perm_services', name: 'manage_services', description: 'Manage Services', module: 'services' },
      { id: 'perm_trips', name: 'manage_trips', description: 'Manage Trips', module: 'trips' },
      { id: 'perm_notifications', name: 'manage_notifications', description: 'Manage Notifications', module: 'notifications' },
      { id: 'perm_news', name: 'manage_news', description: 'Manage News', module: 'news' },
      { id: 'perm_jobs', name: 'manage_jobs', description: 'Manage Jobs', module: 'jobs' },
      { id: 'perm_settings', name: 'manage_settings', description: 'Manage Settings', module: 'settings' },
      { id: 'perm_dashboard', name: 'view_dashboard', description: 'View Dashboard', module: 'dashboard' }
    ];
    
    const insertPerm = database.prepare('INSERT INTO permissions (id, name, description, module) VALUES (?, ?, ?, ?)');
    permissions.forEach(perm => insertPerm.run(perm.id, perm.name, perm.description, perm.module));
    
    // Assign all permissions to admin role
    const insertRolePerm = database.prepare('INSERT INTO role_permissions (id, role_id, permission_id) VALUES (?, ?, ?)');
    permissions.forEach((perm, index) => {
      insertRolePerm.run(`rp_${index}`, 'role_admin', perm.id);
    });
    
    // Seed admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    database.prepare(`
      INSERT INTO admins (id, name, email, password, role_id)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin_1', 'مدير النظام', 'admin@mawaeedak.com', hashedPassword, 'role_admin');
    
    // Seed default settings
    const settings = [
      { id: 'set_app_name', key: 'app_name', value: 'مواعيدك', type: 'text', group_key: 'general' },
      { id: 'set_app_description', key: 'app_description', value: 'تطبيق مواعيدك - خدمات المواعيد والرواتب', type: 'text', group_key: 'general' },
      { id: 'set_contact_email', key: 'contact_email', value: 'info@mawaeedak.com', type: 'text', group_key: 'contact' },
      { id: 'set_contact_phone', key: 'contact_phone', value: '966500000000', type: 'text', group_key: 'contact' },
      { id: 'set_privacy_policy', key: 'privacy_policy', value: 'سياسة الخصوصية الخاصة بتطبيق مواعيدك', type: 'text', group_key: 'legal' },
      { id: 'set_terms', key: 'terms', value: 'شروط الاستخدام', type: 'text', group_key: 'legal' },
      { id: 'set_about', key: 'about', value: 'تطبيق مواعيدك يساعدك في إدارة مواعيدك ورواتبك ودعوماتك', type: 'text', group_key: 'content' },
      { id: 'set_logo_url', key: 'logo_url', value: '/assets/images/logo.png', type: 'text', group_key: 'assets' },
      { id: 'set_bg_pattern', key: 'bg_pattern', value: '/assets/patterns/saudi_pattern.png', type: 'text', group_key: 'assets' },
      { id: 'set_primary_color', key: 'primary_color', value: '#1A5F7A', type: 'color', group_key: 'theme' },
      { id: 'set_secondary_color', key: 'secondary_color', value: '#159895', type: 'color', group_key: 'theme' },
      { id: 'set_accent_color', key: 'accent_color', value: '#57C5B6', type: 'color', group_key: 'theme' }
    ];
    
    const insertSetting = database.prepare('INSERT INTO settings (id, key, value, type, group_key) VALUES (?, ?, ?, ?, ?)');
    settings.forEach(setting => insertSetting.run(setting.id, setting.key, setting.value, setting.type, setting.group_key));
    
    // Seed sample salaries
    const salaries = [
      { id: 'sal_1', title: 'راتب شهر يونيو', amount: 8500, payment_date: '2024-06-25', type: 'salary', description: 'راتب نهاية الشهر' },
      { id: 'sal_2', title: 'راتب شهر يوليو', amount: 8500, payment_date: '2024-07-25', type: 'salary', description: 'راتب نهاية الشهر' },
      { id: 'sal_3', title: 'راتب شهر أغسطس', amount: 8500, payment_date: '2024-08-25', type: 'salary', description: 'راتب نهاية الشهر' }
    ];
    
    const insertSalary = database.prepare('INSERT INTO salaries (id, title, amount, payment_date, type, description) VALUES (?, ?, ?, ?, ?, ?)');
    salaries.forEach(salary => insertSalary.run(salary.id, salary.title, salary.amount, salary.payment_date, salary.type, salary.description));
    
    // Seed sample supports
    const supports = [
      { id: 'sup_1', title: 'دعم سكني', amount: 15000, payment_date: '2024-06-15', type: 'housing', description: 'دعم Ministry of Housing' },
      { id: 'sup_2', title: 'دعم تكيف', amount: 2000, payment_date: '2024-07-01', type: 'utility', description: 'دعم فواتير الكهرباء' },
      { id: 'sup_3', title: 'حساب المواطن', amount: 1200, payment_date: '2024-06-10', type: 'citizen_account', description: 'دعم حساب المواطن الشهري' }
    ];
    
    const insertSupport = database.prepare('INSERT INTO supports (id, title, amount, payment_date, type, description) VALUES (?, ?, ?, ?, ?, ?)');
    supports.forEach(support => insertSupport.run(support.id, support.title, support.amount, support.payment_date, support.type, support.description));
    
    // Seed sample calendar events
    const events = [
      { id: 'evt_1', title: 'موعد مع البنك', description: 'فتح حساب بنكي', event_date: '2024-06-20', event_time: '10:00', category: 'banking', is_public: 1 },
      { id: 'evt_2', title: 'زيارة الطبيب', description: 'فحص دوري', event_date: '2024-06-22', event_time: '14:30', category: 'health', is_public: 1 },
      { id: 'evt_3', title: 'تجديد الإقامة', description: 'رسالة تجديد', event_date: '2024-07-01', event_time: '09:00', category: 'government', is_public: 1 }
    ];
    
    const insertEvent = database.prepare('INSERT INTO calendar_events (id, title, description, event_date, event_time, category, is_public) VALUES (?, ?, ?, ?, ?, ?, ?)');
    events.forEach(event => insertEvent.run(event.id, event.title, event.description, event.event_date, event.event_time, event.category, event.is_public));
    
    // Seed services
    const services = [
      { id: 'srv_1', title: 'أضف موعداً بنفسك', description: 'إنشاء موعد جديد', icon: 'add_calendar', type: 'add_appointment', order_index: 1 },
      { id: 'srv_2', title: 'رحلاتي', description: 'إدارة رحلاتي', icon: 'flight', type: 'trips', order_index: 2 },
      { id: 'srv_3', title: 'اتصل بنا', description: 'تواصل معنا', icon: 'phone', type: 'contact', order_index: 3 },
      { id: 'srv_4', title: 'الأخبار', description: 'آخر الأخبار', icon: 'news', type: 'news', order_index: 4 },
      { id: 'srv_5', title: 'الوظائف', description: 'فرص عمل', icon: 'work', type: 'jobs', order_index: 5 }
    ];
    
    const insertService = database.prepare('INSERT INTO services (id, title, description, icon, type, order_index) VALUES (?, ?, ?, ?, ?, ?)');
    services.forEach(service => insertService.run(service.id, service.title, service.description, service.icon, service.type, service.order_index));
    
    // Seed news
    const news = [
      { id: 'news_1', title: 'تحديث جديد للتطبيق', content: 'تم إصدار تحديث جديد يتضمن تحسينات كبيرة', image_url: '/assets/images/news1.jpg', is_active: 1 },
      { id: 'news_2', title: 'موعد صرف الرواتب', content: 'سيتم صرف الرواتب في الموعد المحدد', image_url: '/assets/images/news2.jpg', is_active: 1 }
    ];
    
    const insertNews = database.prepare('INSERT INTO news (id, title, content, image_url, is_active) VALUES (?, ?, ?, ?, ?)');
    news.forEach(item => insertNews.run(item.id, item.title, item.content, item.image_url, item.is_active));
    
    // Seed jobs
    const jobs = [
      { id: 'job_1', title: 'مطور تطبيقات', company: 'شركة التقنية', location: 'الرياض', description: 'مطلوب مطور تطبيقات موبايل', requirements: 'خبرة 3 سنوات', salary_range: '12000-18000', is_active: 1 },
      { id: 'job_2', title: 'مصمم UI/UX', company: 'وكالة إبداع', location: 'جدة', description: 'مطلوب مصمم واجهات', requirements: 'خبرة سنتين', salary_range: '10000-15000', is_active: 1 }
    ];
    
    const insertJob = database.prepare('INSERT INTO jobs (id, title, company, location, description, requirements, salary_range, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    jobs.forEach(job => insertJob.run(job.id, job.title, job.company, job.location, job.description, job.requirements, job.salary_range, job.is_active));
    
    console.log('✅ Database seeded successfully');
  }
}

module.exports = {
  getDb,
  initializeDatabase
};
