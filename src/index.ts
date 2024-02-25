import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { log } from "console";
import userRoutes from "./routes/user.route"
import restaurantRoutes from "./routes/restaurant.route"
import { v2 as cloudinary } from "cloudinary";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(() => {
  log("Connected to MongoDB");
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
  res.send({message: "Health's Ok!"})
})

app.use("/api/user", userRoutes);
app.use("/api/restaurant", restaurantRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port localhost:${PORT}`);
});
