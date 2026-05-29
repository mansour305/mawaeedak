import { Router, type IRouter } from "express";
import healthRouter from "./health";
import appointmentsRouter from "./appointments";
import financialRouter from "./financial";
import notificationsRouter from "./notifications";
import messagesRouter from "./messages";
import themesRouter from "./themes";
import newsRouter from "./news";
import jobsRouter from "./jobs";
import prayerRouter from "./prayer";
import publicEventsRouter from "./public_events";
import complaintsRouter from "./complaints";
import adminRouter from "./admin";
import storyRouter from "./story";
import automationRouter from "./automation";
import settingsRouter from "./settings";
import socialRouter from "./social";

const router: IRouter = Router();

router.use(healthRouter);
router.use(appointmentsRouter);
router.use(financialRouter);
router.use(notificationsRouter);
router.use(messagesRouter);
router.use(themesRouter);
router.use(newsRouter);
router.use(jobsRouter);
router.use(prayerRouter);
router.use(publicEventsRouter);
router.use(complaintsRouter);
router.use(adminRouter);
router.use(storyRouter);
router.use(automationRouter);
router.use(settingsRouter);
router.use(socialRouter);

export default router;
