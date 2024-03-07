import express from "express";
import multer from "multer";
import {
  createRestaurant,
  getRestaurant,
  updateRestaurant,
} from "../controllers/restaurant.controller";
import { jwtCheck, jwtParse } from "../middleware/auth.middleware";
import { validateRestaurant } from "../middleware/validation.middleware";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get("/", jwtCheck, jwtParse, getRestaurant);

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

export default router;
