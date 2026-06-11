import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(

    {

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      type: {
        type: String,

        enum: [
          "new_bid",
          "outbid",
          "auction_won",
          "auction_ended",
          "buyout",
          "buyout_success",
          "payment_uploaded",
          "transaction_completed",
        ],

        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },

      isRead: {
        type: Boolean,
        default: false,
      },

    },

    {
      timestamps: true,
    }

  );

const Notification =
  mongoose.model(
    "Notification",
    notificationSchema
  );

export default Notification;