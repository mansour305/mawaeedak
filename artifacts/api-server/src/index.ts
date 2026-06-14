import app from "./app";
import { logger } from "./lib/logger";
import cron from "node-cron";
import { generateDailyContent } from "./lib/dailyContentService";
import { runAllScheduledJobs } from "./lib/notificationSchedulerService";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // ── Cron: Daily Content — 1:05 AM Asia/Riyadh ──────────────────────────
  cron.schedule(
    "5 1 * * *",
    async () => {
      logger.info("[Cron] تشغيل مهمة رسالة اليوم");
      await generateDailyContent();
    },
    { timezone: "Asia/Riyadh" },
  );

  // ── Cron: Scheduled Notifications — 7:00 AM Asia/Riyadh ────────────────
  cron.schedule(
    "0 7 * * *",
    async () => {
      logger.info("[Cron] تشغيل مهمة الإشعارات المجدولة");
      await runAllScheduledJobs();
    },
    { timezone: "Asia/Riyadh" },
  );

  logger.info("[Cron] المهام المجدولة مفعّلة (Asia/Riyadh)");
});

