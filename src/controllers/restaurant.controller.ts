import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) {
      res.status(404).json({ message: "User does not have a restaurant" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    console.error("Restaurant Fetch Error:: " + error);
    res.status(500).json({ message: "Error while fetching restaurant" });
  }
};

const createRestaurant = async (req: Request, res: Response) => {
  try {
    const existingRestaurant = await Restaurant.findOne({
      user: req.userId,
    });

    if (existingRestaurant) {
      res.status(409).json({ message: "User already has a restaurant" });
    }

    const image = req.file as Express.Multer.File;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = uploadResponse.url;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();

    res.status(201).send(restaurant);
  } catch (error) {
    console.error("Restaurant Creation Error:: " + error);
    res.status(500).json({ message: "Error while creating restaurant" });
  }
};



export { createRestaurant, getRestaurant };
