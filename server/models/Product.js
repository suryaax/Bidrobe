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

    // 🔥 PRODUCT STATUS
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

    endTime: {
      type: Date,
      required: true,
    },

    // 🔥 SELLER
    seller: {

      type:
        mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

    },

    // 🔥 WINNER
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

    // 🔥 PAYMENT PROOF
    paymentProof: {

      type: String,

      default: "",

    },

    // 🔥 PAYMENT STATUS
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