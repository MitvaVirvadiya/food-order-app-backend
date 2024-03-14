import express from "express"
import { jwtCheck, jwtParse } from "../middleware/auth.middleware"
import { createCheckoutSession, stripeWebhookHandler } from "../controllers/order.controller"

const router = express.Router()

router.post("/checkout/create-checkout-session", jwtCheck, jwtParse, createCheckoutSession)

router.post("/checkout/webhook", stripeWebhookHandler)

export default router 