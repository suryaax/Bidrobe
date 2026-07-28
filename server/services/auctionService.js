import Product from "../models/Product.js";

export const updateExpiredAuctions =
  async () => {
    try {
      const now = new Date();

      const expiredProducts =
        await Product.find({
          status: "active",

          // Hanya produk yang timer-nya
          // benar-benar sudah berjalan
          endTime: {
            $exists: true,
            $type: "date",
            $lte: now,
          },

          winnerNotified: false,
        });

      for (
        const product of expiredProducts
      ) {
        product.status = "ended";
        product.winnerNotified = true;

        await product.save();
      }

      return expiredProducts.length;
    } catch (error) {
      console.error(
        "Gagal memperbarui lelang:",
        error
      );

      throw error;
    }
  };