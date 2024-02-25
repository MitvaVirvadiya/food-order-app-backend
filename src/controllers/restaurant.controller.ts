import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import cloudinary from "cloudinary"
import mongoose from "mongoose";

const createRestaurant = async (req: Request, res: Response) => {
    try {
        const existingRestaurant = await Restaurant.findOne({ user: req.userId })

        if(existingRestaurant){
            return res.status(409).json({ message: "Restaurant already exists" })
        }

        const image = req.file as Express.Multer.File
        const buffer64Image = Buffer.from(image.buffer).toString('base64')
        const dataURI = `data:${image.mimetype};base64,${buffer64Image}`

        const uploadResponse = await cloudinary.v2.uploader.upload(dataURI)

        const restaurant = new Restaurant(req.body)
        restaurant.imageUrl = uploadResponse.url
        restaurant.user = new mongoose.Types.ObjectId(req.userId)
        restaurant.lastUpdated = new Date()

        await restaurant.save()

        return res.status(201).json(restaurant)
    } catch (error) {
        console.error("Restaurant Creation Error:: " + error);
        return res.status(500).json({ message: "Error while creating restaurant" });
    }
}

export default {
    createRestaurant
}