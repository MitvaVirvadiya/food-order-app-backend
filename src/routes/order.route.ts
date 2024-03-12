import express from "express"
import { jwtCheck, jwtParse } from "../middleware/auth.middleware"
import { createCheckoutSession } from "../controllers/order.controller"

const router = express.Router()

router.post("/checkout/create-checkout-session", jwtCheck, jwtParse, createCheckoutSession)

export default router