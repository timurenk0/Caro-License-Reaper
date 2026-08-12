import { Router } from "express"
import healthRoute from "./health.route"
import uploadCSVRoute from "./upload-csv.route"
import startRoute from "./start.route"
import jobsRoute from "./jobs.route"


const router = Router();

router.use(healthRoute);
router.use(uploadCSVRoute);
router.use(startRoute);
router.use(jobsRoute);


export default router;