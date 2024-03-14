import express from "express";
import multer from "multer";
import {
  createRestaurant,
  getRestaurantById,
  getRestaurantOrders,
  getRestaurants,
  searchRestaurants,
  updateOrderStatus,
  updateRestaurant,
} from "../controllers/restaurant.controller";
import { jwtCheck, jwtParse } from "../middleware/auth.middleware";
import { validateRestaurant } from "../middleware/validation.middleware";
import { param } from "express-validator";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get("/orders", jwtCheck, jwtParse, getRestaurantOrders);
router.patch("/order/:orderId/status", jwtCheck, jwtParse, updateOrderStatus);

router.get("/", jwtCheck, jwtParse, getRestaurants);

router.post(
  "/",
  upload.single("imageFile"),
  validateRestaurant,
  jwtCheck,
  jwtParse,
  createRestaurant
);

router.put(
  "/",
  upload.single("imageFile"),
  validateRestaurant,
  jwtCheck,
  jwtParse,
  updateRestaurant
);

// search
router.get(
  "/:restaurantId",
  param("restaurantId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("RestaurantId paramenter must be a valid string"),
    getRestaurantById
);

router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City paramenter must be a valid string"),
  searchRestaurants
);

export default router;
