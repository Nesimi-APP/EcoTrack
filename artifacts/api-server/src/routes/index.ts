import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import entriesRouter from "./entries.js";
import meRouter from "./me.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(entriesRouter);
router.use(meRouter);

export default router;
