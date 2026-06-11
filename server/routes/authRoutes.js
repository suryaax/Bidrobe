import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {

  try {

    const {
      username,
      email,
      password,
      phoneNumber,
    } = req.body;

    // CHECK EXISTING EMAIL
    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already used",
      });
    }

    // CREATE USER
    const hashedPassword =
        await bcrypt.hash(password, 10);

    console.log(req.body);

    const user = await User.create({
        username,
        email,

        password: hashedPassword,

        phoneNumber,
    });

    res.status(201).json({
      message: "User created",
      user,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});

router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body;

    // FIND USER
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // CHECK PASSWORD
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    // CREATE TOKEN
    const token = jwt.sign(
      {
        id: user._id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({

      message: "Login success",

      token,

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },

    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

});

router.get("/me", protect, (req, res) => {

  res.json(req.user);

});

router.put(

  "/profile",

  protect,

  async (req, res) => {

    try {

      const {

        username,
        email,
        phoneNumber,
        password,

      } = req.body;

      // FIND USER
      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {

        return res.status(404).json({
          message: "User not found",
        });

      }

      // UPDATE BASIC INFO
      user.username =
        username || user.username;

      user.email =
        email || user.email;

      user.phoneNumber =
        phoneNumber || user.phoneNumber;

      // UPDATE PASSWORD
      if (password && password.trim() !== "") {

        const hashedPassword =
          await bcrypt.hash(
            password,
            10
          );

        user.password =
          hashedPassword;

      }

      await user.save();

      res.status(200).json({

        message:
          "Profile updated successfully",

        user,

      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  }

);

export default router;