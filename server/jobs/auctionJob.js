import cron from "node-cron";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";

import Bid from "../models/Bid.js";

const startAuctionJob = () => {
  // EVERY MINUTE
  cron.schedule("* * * * *", async () => {
    try {
      console.log("Checking auctions...");
      const expiredProducts =
        await Product.find({
          status: "active",
          endTime: {
            $lte: new Date(),
          },
        });
      for (const product of expiredProducts) {
        // IF HAS BIDDER
        if (product.lastBidder) {
            product.status = "sold";
            // WINNER
            await Notification.create({
                user: product.lastBidder,
                type: "won",
                product: product._id,
                message:
                `You won the auction: ${product.title}`,
            });
            // LOSERS
            const losingBids = await Bid.find({
                product: product._id,
                bidder: {
                $ne: product.lastBidder,
                },
            });
            const uniqueLosers =
                [...new Set(
                losingBids.map(
                    (bid) => bid.bidder.toString()
                )
                )];
            for (const loserId of uniqueLosers) {
                await Notification.create({
                user: loserId,
                type: "lost",
                product: product._id,
                message:
                    `You lost the auction: ${product.title}`,
                });
            }
            } else {
            product.status = "ended";
            }
        await product.save();
        console.log(
          `Auction ended: ${product.title}`
        );
      }
    } catch (error) {
      console.log(error);
    }
  });
};

export default startAuctionJob;