import express from "express"
import userController  from "../controllers/user.controller"
import { jwtCheck, jwtParse } from "../middleware/auth.middleware"

const router = express.Router()

router.get("/", jwtCheck, jwtParse, userController.getCurrentUser)
router.post("/", jwtCheck, userController.createCurrentUser)
router.put("/", jwtCheck, jwtParse, userController.updateCurrentUser)

export default router