import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    startingBid: {
      type: Number,
      required: true,
      min: 0,
    },
    currentBid: {
      type: Number,
      required: true,
      min: 0,
    },
    buyoutPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    bidCount: {
      type: Number,
      default: 0,
    },
    auctionDurationHours: {
      type: Number,
      required: true,
      min: 1,
    },
    auctionStartedAt: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "active",
        "ended",
        "sold",
        "completed",
      ],
      default: "active",
    },
    seller: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastBidder: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    winnerNotified: {
      type: Boolean,
      default: false,
    },
    paymentProof: {
      type: String,
      default: "",
    },
    paymentSubmitted: {
      type: Boolean,
      default: false,
    },
    transactionCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.model(
    "Product",
    productSchema
  );

export default Product;