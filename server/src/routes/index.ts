import { Router } from "express"
import healthRoute from "./health.route"
import uploadCSVRoute from "./upload-csv.route"
import startRoute from "./start.route"
import jobsRoute from "./jobs.route"
import loginRoute from "./login.route"


const router = Router();

router.use(healthRoute);
router.use(uploadCSVRoute);
router.use(startRoute);
router.use(jobsRoute);
router.use(loginRoute);


export default router;