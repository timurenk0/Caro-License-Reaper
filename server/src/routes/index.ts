import { Router } from "express"
import healthRoute from "./health.route"
import uploadCSVRoute from "./upload-csv.route"
import startRoute from "./start.route"


const router = Router();

router.use(healthRoute);
router.use(uploadCSVRoute);
router.use(startRoute);


export default router;