import cron from "node-cron";
import {
  updateExpiredAuctions,
} from "../services/auctionService.js";

const startAuctionJob = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Memeriksa lelang...");
    await updateExpiredAuctions();
  });
};

export default startAuctionJob;