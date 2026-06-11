import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {

  try {

    let token;

    // CHECK HEADER
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token =
        req.headers.authorization.split(" ")[1];

      // VERIFY TOKEN
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // FIND USER
      req.user = await User.findById(decoded.id)
        .select("-password");

      next();

    } else {

      return res.status(401).json({
        message: "Not authorized",
      });

    }

  } catch (error) {

    res.status(401).json({
      message: "Token failed",
    });

  }

};

export default protect;