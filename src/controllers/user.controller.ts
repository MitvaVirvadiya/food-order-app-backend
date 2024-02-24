import { Request, Response } from "express";
import { User } from "../models/user.model";

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.toObject());
  } catch (error) {
    console.error("User Fetch Error:: " + error);
    return res.status(500).json({ message: "Error while Fetching user" });
  }
}

const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;

    const existingUser = await User.findOne({ auth0Id });
    if (existingUser) {
      return res.status(200).send();
    }

    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.error("User Creation Error:: " + error);
    return res.status(500).json({ message: "Error while creating user" });
  }
};

const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { name, address, city, country } = req.body;

    const user = await User.findById(req.userId)

    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.address = address;
    user.city = city;
    user.country = country;
    await user.save();

    return res.send(user)
  } catch (error) {
    console.error("User Updation Error:: " + error);
    return res.status(500).json({ message: "Error while updating user" });
  }
}

export default { getCurrentUser, createCurrentUser, updateCurrentUser };
