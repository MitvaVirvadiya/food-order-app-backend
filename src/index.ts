import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { log } from "console";
import userRoutes from "./routes/user.route"

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(() => {
  log("Connected to MongoDB");
});

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
  res.send({message: "Health's Ok!"})
})

app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port localhost:${PORT}`);
});
