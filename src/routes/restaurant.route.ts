import express from "express";
import multer from "multer";
import restaurantController from "../controllers/restaurant.controller";
import { ValidateRestaurant } from "../middleware/validation.middleware";
import { jwtCheck, jwtParse } from "../middleware/auth.middleware";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/",
  upload.single("imageFile"),
  ValidateRestaurant,
  jwtCheck,
  jwtParse,
  restaurantController.createRestaurant
);

export default router;
