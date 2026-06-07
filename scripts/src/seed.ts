import { db, pool } from "@workspace/db";
import {
  dailyMessagesTable,
  financialEventsTable,
  notificationsTable,
  storyTemplatesTable,
  themesTable,
  appointmentsTable,
  newsTable,
  jobsTable,
} from "@workspace/db";

async function rowCount(tableName: string): Promise<number> {
  const res = await pool.query(`SELECT COUNT(*)::int AS c FROM "${tableName}"`);
  return (res.rows[0] as { c: number }).c;
}

function nextMonthDay(day: number): string {
  const today = new Date();
  const candidate = new Date(today.getFullYear(), today.getMonth(), day);
  if (candidate <= today) {
    return new Date(today.getFullYear(), today.getMonth() + 1, day).toISOString().split("T")[0];
  }
  return candidate.toISOString().split("T")[0];
}

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

async function seedDailyMessages() {
  const c = await rowCount("daily_messages");
  if (c > 0) { console.log(`  daily_messages: ${c} صف موجود، تجاهل.`); return; }
  await db.insert(dailyMessagesTable).values([
    { message: "من رتّب يومه ملك وقته.", is_active: true },
    { message: "الصبر مفتاح الفرج، وما أقرب الفرج من أهل الصبر.", is_active: true },
    { message: "يومك يبدأ بقرار، فاجعله قراراً نافعاً.", is_active: true },
    { message: "الوقت إذا حُفظ أثمر.", is_active: true },
    { message: "رتّب مواعيدك، ترتّب أولوياتك.", is_active: true },
    { message: "كل موعد له وقته، وكل وقت له قيمة.", is_active: true },
    { message: "خذ من يومك ما يعينك على غدك.", is_active: true },
    { message: "البداية المنظمة تختصر نصف الطريق.", is_active: true },
  ]);
  console.log("  daily_messages: تم إدراج 8 رسائل.");
}

async function seedFinancialEvents() {
  const c = await rowCount("financial_events");
  if (c > 0) { console.log(`  financial_events: ${c} صف موجود، تجاهل.`); return; }
  await db.insert(financialEventsTable).values([
    { name: "الراتب الشهري", type: "salary", next_date: nextMonthDay(1), amount: "0", notes: "راتب أول الشهر", is_active: true, reminder_days_before: 3, user_id: "system" },
    { name: "حساب المواطن", type: "support", next_date: nextMonthDay(10), amount: "0", notes: "دعم نقدي شهري", is_active: true, reminder_days_before: 3, user_id: "system" },
    { name: "الضمان الاجتماعي", type: "support", next_date: nextMonthDay(25), amount: "0", notes: "مستحق الضمان", is_active: true, reminder_days_before: 3, user_id: "system" },
    { name: "حافز", type: "support", next_date: nextMonthDay(15), amount: "0", notes: "برنامج حافز", is_active: true, reminder_days_before: 3, user_id: "system" },
    { name: "الدعم السكني", type: "support", next_date: futureDate(37), amount: "0", notes: "دعم وزارة الإسكان", is_active: true, reminder_days_before: 5, user_id: "system" },
    { name: "ساند / التأمينات", type: "support", next_date: nextMonthDay(20), amount: "0", notes: "تأمين ضد التعطل", is_active: true, reminder_days_before: 3, user_id: "system" },
    { name: "التقاعد", type: "salary", next_date: nextMonthDay(1), amount: "0", notes: "راتب التقاعد", is_active: true, reminder_days_before: 3, user_id: "system" },
    { name: "الدعم الزراعي", type: "support", next_date: futureDate(45), amount: "0", notes: "دعم وزارة البيئة والمياه والزراعة", is_active: true, reminder_days_before: 5, user_id: "system" },
    { name: "التأهيل الشامل", type: "support", next_date: nextMonthDay(27), amount: "0", notes: "إعانة التأهيل الشامل - مدار من المنصة (تقديري)", is_active: true, reminder_days_before: 3, user_id: "system" },
    { name: "دعم ريف", type: "support", next_date: futureDate(52), amount: "0", notes: "دعم الأسر المنتجة والريف - مدار من المنصة (تقديري)", is_active: true, reminder_days_before: 5, user_id: "system" },
  ]);
  console.log("  financial_events: تم إدراج 10 أحداث مالية.");
}

// Idempotent backfill — runs even on already-populated databases. Inserts only
// the required support programs that are missing (matched by name).
async function ensureSupportPrograms() {
  const required = [
    { name: "حساب المواطن", next_date: nextMonthDay(10), notes: "دعم نقدي شهري", reminder_days_before: 3 },
    { name: "الضمان الاجتماعي", next_date: nextMonthDay(25), notes: "مستحق الضمان", reminder_days_before: 3 },
    { name: "حافز", next_date: nextMonthDay(15), notes: "برنامج حافز", reminder_days_before: 3 },
    { name: "الدعم السكني", next_date: futureDate(37), notes: "دعم وزارة الإسكان", reminder_days_before: 5 },
    { name: "ساند / التأمينات", next_date: nextMonthDay(20), notes: "تأمين ضد التعطل", reminder_days_before: 3 },
    { name: "الدعم الزراعي", next_date: futureDate(45), notes: "دعم وزارة البيئة والمياه والزراعة", reminder_days_before: 5 },
    { name: "التأهيل الشامل", next_date: nextMonthDay(27), notes: "إعانة التأهيل الشامل - مدار من المنصة (تقديري)", reminder_days_before: 3 },
    { name: "دعم ريف", next_date: futureDate(52), notes: "دعم الأسر المنتجة والريف - مدار من المنصة (تقديري)", reminder_days_before: 5 },
  ];
  const existing = await db.select({ name: financialEventsTable.name }).from(financialEventsTable);
  const have = new Set(existing.map(r => r.name));
  const missing = required.filter(r => !have.has(r.name));
  if (missing.length === 0) { console.log("  support programs: مكتملة، لا حاجة للإضافة."); return; }
  await db.insert(financialEventsTable).values(
    missing.map(r => ({ name: r.name, type: "support", next_date: r.next_date, amount: "0", notes: r.notes, is_active: true, reminder_days_before: r.reminder_days_before, user_id: "system" }))
  );
  console.log(`  support programs: تمت إضافة ${missing.length} برنامج ناقص.`);
}

async function seedNotifications() {
  const c = await rowCount("notifications");
  if (c > 0) { console.log(`  notifications: ${c} صف موجود، تجاهل.`); return; }
  await db.insert(notificationsTable).values([
    { title: "مرحباً بك في مواعيدك", body: "تم إعداد المنصة بنجاح. يمكنك الآن إدارة مواعيدك ومصادرك المالية.", type: "general", is_read: false },
    { title: "تذكير: موعد قادم", body: "لديك مواعيد قادمة هذا الأسبوع، تحقق من التقويم.", type: "reminder", is_read: false },
  ]);
  console.log("  notifications: تم إدراج 2 إشعار.");
}

async function seedStoryTemplates() {
  const c = await rowCount("story_templates");
  if (c > 0) { console.log(`  story_templates: ${c} صف موجود، تجاهل.`); return; }
  await db.insert(storyTemplatesTable).values([
    {
      name: "القالب الافتراضي",
      description: "قالب ستوري اليوم الأساسي بتصميم التراث",
      template_text: "📅 {date}\n\n💬 {message}\n\n🕌 الصلاة القادمة: {next_prayer} بعد {time_remaining}\n\n💰 {financial_summary}\n\n— مواعيدك",
      background_color: "#8B6914",
      text_color: "#FFF8E7",
      is_active: true,
    },
    {
      name: "القالب التراثي البسيط",
      description: "قالب مختصر بروح التراث السعودي",
      template_text: "بسم الله الرحمن الرحيم\n\n{date}\n\n{message}\n\n— مواعيدك",
      background_color: "#5C4A1E",
      text_color: "#F5E6C8",
      is_active: true,
    },
  ]);
  console.log("  story_templates: تم إدراج 2 قالب.");
}

async function seedThemes() {
  const c = await rowCount("themes");
  if (c > 0) { console.log(`  themes: ${c} صف موجود، تجاهل.`); return; }
  await db.insert(themesTable).values([
    {
      name: "التراث التقني الفاخر",
      slug: "heritage",
      description: "ثيم ذهبي/نحاسي/بيج — الثيم الافتراضي",
      colors: { primary: "#8B6914", secondary: "#C4963A", background: "#FFF8E7", text: "#3D2B1F" },
      is_active: true,
      is_available: true,
      tier: "free",
    },
    {
      name: "الليل الهادئ",
      slug: "dark-night",
      description: "ثيم داكن للاستخدام الليلي",
      colors: { primary: "#4A90D9", secondary: "#7BB3F0", background: "#1A1A2E", text: "#E8E8F0" },
      is_active: true,
      is_available: true,
      tier: "free",
    },
    {
      name: "الفجر الذهبي",
      slug: "golden-dawn",
      description: "ثيم فاتح بألوان الفجر الذهبية",
      colors: { primary: "#D4A017", secondary: "#F0C040", background: "#FFFDF0", text: "#2D1B00" },
      is_active: true,
      is_available: true,
      tier: "free",
    },
  ]);
  console.log("  themes: تم إدراج 3 ثيمات.");
}

async function seedAppointments() {
  const c = await rowCount("appointments");
  if (c > 0) { console.log(`  appointments: ${c} صف موجود، تجاهل.`); return; }
  await db.insert(appointmentsTable).values([
    {
      title: "موعد طبي",
      description: "مراجعة المستشفى — فحص دوري",
      date: futureDate(4),
      time: "10:00",
      category: "صحة",
      color: "#4CAF50",
      priority: "high",
      reminder_enabled: true,
      user_id: "system",
    },
    {
      title: "تجديد الرخصة",
      description: "تجديد رخصة القيادة في المرور",
      date: futureDate(8),
      time: "09:00",
      category: "شخصي",
      color: "#2196F3",
      priority: "medium",
      reminder_enabled: true,
      user_id: "system",
    },
  ]);
  console.log("  appointments: تم إدراج 2 موعد.");
}

async function seedNews() {
  const c = await rowCount("news");
  if (c > 0) { console.log(`  news: ${c} صف موجود، تجاهل.`); return; }
  await db.insert(newsTable).values([
    {
      title: "إطلاق منصة مواعيدك للإدارة اليومية",
      body: "أُطلقت منصة مواعيدك لتقديم حلول متكاملة لإدارة المواعيد والموارد المالية اليومية.",
      category: "تقنية",
      source: "مواعيدك",
      is_published: true,
    },
    {
      title: "نصائح لتنظيم وقتك اليومي",
      body: "خبراء الإنتاجية يقدمون أبرز النصائح لتنظيم المواعيد وضبط الأولويات.",
      category: "مجتمع",
      source: "مواعيدك",
      is_published: true,
    },
  ]);
  console.log("  news: تم إدراج 2 خبر.");
}

async function seedJobs() {
  const c = await rowCount("jobs");
  if (c > 0) { console.log(`  jobs: ${c} صف موجود، تجاهل.`); return; }
  await db.insert(jobsTable).values([
    {
      title: "مطوّر تطبيقات جوال",
      employer: "شركة التقنية الذكية",
      sector: "تقنية المعلومات",
      city: "الرياض",
      description: "مطلوب مطوّر React Native لتطوير تطبيقات الجوال.",
      deadline: futureDate(30),
      is_active: true,
    },
    {
      title: "محاسب مالي",
      employer: "مجموعة الأفق التجارية",
      sector: "المالية والمحاسبة",
      city: "جدة",
      description: "خبرة لا تقل عن ثلاث سنوات في المحاسبة والتقارير المالية.",
      deadline: futureDate(21),
      is_active: true,
    },
  ]);
  console.log("  jobs: تم إدراج 2 وظيفة.");
}

async function main() {
  console.log("بدء عملية seed...\n");
  try {
    await seedDailyMessages();
    await seedFinancialEvents();
    await ensureSupportPrograms();
    await seedNotifications();
    await seedStoryTemplates();
    await seedThemes();
    await seedAppointments();
    await seedNews();
    await seedJobs();
    console.log("\naكتملت عملية seed بنجاح.");
  } catch (err) {
    console.error("خطأ أثناء seed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
