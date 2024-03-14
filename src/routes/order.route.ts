import express from "express"
import { jwtCheck, jwtParse } from "../middleware/auth.middleware"
import { createCheckoutSession, getOrders, stripeWebhookHandler } from "../controllers/order.controller"

const router = express.Router()

router.get("/", jwtCheck, jwtParse, getOrders)
router.post("/checkout/create-checkout-session", jwtCheck, jwtParse, createCheckoutSession)

router.post("/checkout/webhook", stripeWebhookHandler)

export default router 