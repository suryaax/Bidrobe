import dotenv from "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import startAuctionJob
from "./jobs/auctionJob.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Bidrobe API Running");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log("MongoDB Connected");

    // START AUCTION CHECKER
    startAuctionJob();

    app.listen(PORT, () => {

      console.log(
        `Server running on ${PORT}`
      );
    });
  })

  .catch((err) => console.log(err));