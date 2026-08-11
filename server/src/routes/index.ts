import { Router } from "express"
import healthRoute from "./health.route"
import uploadCSVRoute from "./upload-csv.route"


const router = Router();

router.use(healthRoute);
router.use(uploadCSVRoute);


export default router;