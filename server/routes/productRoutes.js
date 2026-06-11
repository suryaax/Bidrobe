import express from "express";
import Product from "../models/Product.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import Bid from "../models/Bid.js";
import Notification from "../models/Notification.js";

const router = express.Router();

const updateExpiredAuctions =
  async () => {
    try {
      const expiredProducts =
        await Product.find({
          endTime: {
            $lt: new Date(),
          },
          status: "active",
          winnerNotified: false,
        });
      for (
        const product
        of expiredProducts
      ) {
        // UPDATE STATUS
        product.status =
          "ended";
        await product.save();
        // ADA PEMENANG
        if (
          product.lastBidder
        ) {
          // BUYER
          await Notification.create({
            user:
              product.lastBidder,
            type:
              "auction_won",
            product:
              product._id,
            message:
              `Anda memenangkan lelang ${product.title}`,
          });

          // SELLER
          await Notification.create({
            user:
              product.seller,
            type:
              "auction_ended",
            product:
              product._id,
            message:
              `Lelang ${product.title} telah selesai dan memiliki pemenang`,
          });
        }

        // IMPORTANT
        product.winnerNotified =
          true;
        await product.save();
      }
    } catch (error) {
      console.log(
        "Pembaruan lelang error:",
        error
      );
    }
};

router.post(
  "/upload-image",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Tidak ada gambar terunggah",
        });

      }
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "bidrobe",
            },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer)
            .pipe(stream);
        });
      };
      const result = await streamUpload();
      res.status(200).json({
        imageUrl: result.secure_url,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

router.post("/", protect, async (req, res) => {
  try {
  await updateExpiredAuctions();
    const {
      title,
      description,
      images,
      category,
      subCategory,
      brand,
      currentBid,
      buyoutPrice,
      durationHours,
    } = req.body;

    // CREATE END TIME
    const endTime = new Date(
      Date.now() +
      durationHours * 60 * 60 * 1000
    );

    // CREATE PRODUCT
    const product = await Product.create({
      title,
      description,
      images,
      category,
      subCategory,
      brand,
      currentBid,
      buyoutPrice,
      endTime,
      seller: req.user._id,
    });
    res.status(201).json({
      message: "Produk berhasil diunggah",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET RECOMMENDATIONS
router.get(
  "/:id/recommendations",
  async (req, res) => {

    try {

      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {

        return res.status(404).json({
          message:
            "Produk tidak ditemukan",
        });

      }

      let recommendations =
        await Product.find({

          _id: {
            $ne: product._id,
          },

          subCategory:
            product.subCategory,

          status: "active",

        })

          .limit(4)

          .sort({
            createdAt: -1,
          });

      // FALLBACK
      if (
        recommendations.length < 4
      ) {

        recommendations =
          await Product.find({

            _id: {
              $ne: product._id,
            },

            category:
              product.category,

            status: "active",

          })

            .limit(4)

            .sort({
              createdAt: -1,
            });

      }

      res.status(200).json(
        recommendations
      );

    } catch (error) {

      res.status(500).json({

        message:
          error.message,

      });

    }

  }
);

router.get("/", async (req, res) => {
  await updateExpiredAuctions();

  try {
    const {
      category,
      subCategory,
      sort,
      search,
    } = req.query;
    // FILTER OBJECT
    const filter = {
      status: "active",
    };
    // SEARCH BY TITLE
    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }
    // CATEGORY FILTER
    if (category) {
      filter.category =
        category;
    }
    // SUB CATEGORY FILTER
    if (subCategory) {
      filter.subCategory =
        subCategory;
    }
    // SORT LOGIC
    let sortOption = {
      createdAt: -1,
    };
    // HOT BID
    if (sort === "hot") {
      sortOption = {
        bidCount: -1,
      };
    }
    // ENDING SOON
    if (sort === "ending") {
      sortOption = {
        endTime: 1,
      };
    }
    // NEWLY UPLOADED
    if (sort === "new") {
      sortOption = {
        createdAt: -1,
      };
    }
    const products =
      await Product.find(filter)
      .populate(
        "seller",
        "username avatar"
      )
      .populate(
        "lastBidder",
        "username"
      )
      .sort(sortOption);
    res.status(200).json(
      products
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post(
  "/:id/bid",
  protect,
  async (req, res) => {
    try {
    await updateExpiredAuctions();
      const { amount } = req.body;

      // FIND PRODUCT
      const product =
        await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Produk tidak ditemukan",
        });
      }

      if (
        new Date() >
        product.endTime
      ) {

        product.status =
          "ended";
        await product.save();
        return res.status(400).json({
          message:
            "Pelelangan Berakhir",
        });
      }

      // CHECK AUCTION STATUS
      if (product.status !== "active") {
        return res.status(400).json({
          message: "Pelelangan Berakhir",
        });
      }

      // CHECK BID VALUE
      if (amount <= product.currentBid) {
        return res.status(400).json({
          message:
            "Tawaran harus lebih tinggi dari sebelumnya",
        });
      }

      if (
        amount >=
        product.buyoutPrice
      ) {

        return res.status(400).json({
          message:
            "Penawaran kamu melebihi harga Beli Sekarang. Gunakan tombol Beli Sekarang untuk membeli produk ini",
        });
      }

      // CREATE BID HISTORY
      const bid = await Bid.create({
        product: product._id,
        bidder: req.user._id,
        amount,
      });

      await Notification.create({
        user: product.seller,
        type: "new_bid",
        product: product._id,
        message:
          `${req.user.username} menawar produk ${product.title}`,
      });

      if (
        product.lastBidder &&
        product.lastBidder.toString() !==
        req.user._id.toString()
        ) {
        await Notification.create({
            user: product.lastBidder,
            type: "outbid",
            product: product._id,
            message:
            `Orang lain telah mengalahkan tawaran anda: ${product.title}`,
        });
        }

      // UPDATE PRODUCT
      product.currentBid = amount;
      product.lastBidder = req.user._id;
      product.bidCount += 1;
      await product.save();
      res.status(201).json({
        message: "Tawaran berhasil diajukan",
        bid,
        product,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

router.post(
  "/:id/buy-now",
  protect,
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Produk tidak ditemukan",
        });
      }

      if (
        product.status !== "active"
      ) {
        return res.status(400).json({
          message:
            "Pelelangan sudah berakhir",
        });
      }

      await Bid.create({
        product: product._id,
        bidder: req.user._id,
        amount: product.buyoutPrice,
      });

      product.currentBid =
        product.buyoutPrice;

      product.lastBidder =
        req.user._id;

      product.status =
        "sold";

      await product.save();

      await Notification.create({
        user: product.seller,
        type: "buyout",
        product: product._id,
        message:
          `${req.user.username} membeli produk ${product.title} melalui Beli Sekarang`,
      });

      await Notification.create({
        user: req.user._id,
        type: "buyout_success",
        product: product._id,
        message:
          `Anda berhasil membeli ${product.title} melalui Beli Sekarang`,
      });

      res.status(200).json({
        message:
          "Produk berhasil di beli",
        product,
      });

    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

router.get(
  "/my-bids",
  protect,
  async (req, res) => {
    try {
      // UPDATE EXPIRED AUCTIONS
      await updateExpiredAuctions();
      const bids = await Bid.find({
        bidder: req.user._id,
      })
      .populate({
        path: "product",
        populate: [
          {
            path: "seller",
            select:
              "username phoneNumber",
          },
          {
            path: "lastBidder",
            select:
              "username",
          },
        ],
      })
      .sort({
        createdAt: -1,
      });
      // REMOVE DUPLICATE PRODUCTS
      const uniqueProducts = [];
      const productIds =
        new Set();
      bids.forEach((bid) => {
        if (
          bid.product &&
          !productIds.has(
            bid.product._id.toString()
          )
        ) {
          productIds.add(
            bid.product._id.toString()
          );
          // DEFAULT STATUS
          let status = "active";

          // BUY NOW
          if (
            bid.product.status === "sold" ||
            bid.product.status === "completed"
          ) {

            if (
              bid.product.lastBidder?._id?.toString() ===
              req.user._id.toString()
            ) {
              status = "won";
            } else {
              status = "lost";
            }
          }

          // AUCTION ENDED
          else if (
            new Date() >
            new Date(
              bid.product.endTime
            )
          ) {

            if (
              bid.product.lastBidder?._id?.toString() ===
              req.user._id.toString()
            ) {
              status = "won";
            } else {
              status = "lost";
            }
          }

          uniqueProducts.push({
            product: bid.product,
            yourBid:
              bid.amount,
            status,
          });
        }
      });
      res.status(200).json(
        uniqueProducts
      );
    }
    catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

router.get(
  "/notifications",
  protect,
  async (req, res) => {
    try {
      await updateExpiredAuctions();
      const notifications =
        await Notification.find({
          user: req.user._id,
        })
        .populate(
          "product",
          "title images"
        )
        .sort({
          createdAt: -1,
        });
      res.status(200).json(
        notifications
      );
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

router.put(
  "/notifications/read-all",
  protect,
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          user: req.user._id,
          isRead: false,
        },

        {
          $set: {
            isRead: true,
          },
        }
      );

      res.status(200).json({
        message:
          "Semua notifikasi telah dibaca",
      });
    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

router.get(
  "/my-products",
  protect,
  async (req, res) => {
    try {
      await updateExpiredAuctions();
      const products =
        await Product.find({
          seller: req.user._id,
        })
        .populate(
          "seller",
          "username email"
        )
        .populate(
          "lastBidder",
          "username"
        )
        .sort({
          createdAt: -1,
        });
      res.status(200).json(
        products
      );
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

router.get(
  "/search",
  async (req, res) => {

    try {

      const query =
        req.query.q?.trim();

      if (!query) {

        return res.json([]);

      }

      let searchTerm =
        query.toLowerCase();

      const categoryAliases = {

        pria: "Men",
        wanita: "Women",
        anak: "Children",
        unisex: "Unisex",

        sepatu: "Sepatu",
        celana: "Celana",
        aksesoris: "Aksesoris",

      };

      if (
        categoryAliases[
          searchTerm
        ]
      ) {

        searchTerm =
          categoryAliases[
            searchTerm
          ];

      }

      const products =
        await Product.find({

          status: "active",

          $or: [

            {
              title: {
                $regex: searchTerm,
                $options: "i",
              },
            },

            {
              description: {
                $regex: searchTerm,
                $options: "i",
              },
            },

            {
              brand: {
                $regex: searchTerm,
                $options: "i",
              },
            },

            {
              category: {
                $regex: searchTerm,
                $options: "i",
              },
            },

            {
              subCategory: {
                $regex: searchTerm,
                $options: "i",
              },
            },

          ],

        })
        .populate(
          "lastBidder",
          "username"
        )
        .sort({
          createdAt: -1,
        });

      res.status(200).json(
        products
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });

    }

  }
);

router.get(
  "/:id",
  async (req, res) => {
    try {
      await updateExpiredAuctions();
      const product =
        await Product.findById(
          req.params.id
        )
        .populate(
          "seller",
          "username phoneNumber"
        )
        .populate(
          "lastBidder",
          "username"
        );
      if (!product) {
        return res.status(404).json({
          message:
            "Produk tidak ditemukan",
        });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);


router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {
      await updateExpiredAuctions();
      // FIND PRODUCT
      const product =
        await Product.findById(
          req.params.id
        );
      // CHECK EXIST
      if (!product) {
        return res.status(404).json({
          message:
            "Produk tidak ditemukan",
        });
      }
      // CHECK OWNER
      if (
        product.seller.toString() !==
        req.user._id.toString()
      ) {
        return res.status(401).json({
          message:
            "Tidak diizinkan",
        });
      }
      // DELETE PRODUCT
      await product.deleteOne();
      res.status(200).json({
        message:
          "Produk berhasil dihapus",
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

router.put(
  "/:id",
  protect,
  async (req, res) => {
    try {
      await updateExpiredAuctions();
      const product =
        await Product.findById(
          req.params.id
        );

      // CHECK EXIST
      if (!product) {
        return res.status(404).json({
          message:
            "Produk tidak ditemukan",
        });
      }

      // CHECK OWNER
      if (
        product.seller.toString() !==
        req.user._id.toString()
      ) {
        return res.status(401).json({
          message:
            "Tidak diizinkan",
        });
      }

      const {
        title,
        description,
        images,
        category,
        subCategory,
        brand,
        currentBid,
        buyoutPrice,
        durationHours,
      } = req.body;
      // UPDATE
      product.title =
        title || product.title;

      product.description =
        description || product.description;

      product.images =
        images || product.images;

      product.category =
        category || product.category;

      product.subCategory =
        subCategory || product.subCategory;

      product.brand =
        brand || product.brand;

      product.currentBid =
        currentBid || product.currentBid;

      product.buyoutPrice =
        buyoutPrice || product.buyoutPrice;

      // OPTIONAL RESET ENDTIME
      if (durationHours) {
        product.endTime =
          new Date(
            Date.now() +
            durationHours *
            60 *
            60 *
            1000
          );
      }

      await product.save();
      res.status(200).json({
        message:
          "Produk berhasil diperbarui",
        product,
      });

    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

// UPLOAD PAYMENT PROOF
router.put(
  "/:id/payment-proof",
  protect,
  upload.single("paymentProof"),
  async (req, res) => {
    try {
      // CHECK FILE
      if (!req.file) {
        return res.status(400).json({
          message:
            "Tidak ada bukti pembayaran terunggah",
        });
      }

      // FIND PRODUCT
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Produk tidak ditemukan",
        });
      }

      // ONLY WINNER CAN UPLOAD
      if (
        product.lastBidder?.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "Tidak diizinkan",
        });
      }

      // UPLOAD TO CLOUDINARY
      const streamUpload = () => {
        return new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "bidrobe/payment-proofs",
                },
                (
                  error,
                  result
                ) => {
                  if (result) {
                    resolve(result);
                  } else {
                    reject(error);
                  }
                }
              );
            streamifier
              .createReadStream(
                req.file.buffer
              )
              .pipe(stream);
          }
        );
      };
      const result =
        await streamUpload();

      // SAVE TO DATABASE
      product.paymentProof =
        result.secure_url;

      product.paymentSubmitted =
        true;

      await product.save();
      await Notification.create({
        user: product.seller,
        type: "payment_uploaded",
        product: product._id,
        message:
          `Bukti pembayaran untuk ${product.title} telah diupload`,
      });

      res.status(200).json({
        message:
          "Bukti pembayaran berhasil diunggah",
        product,
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

// CONFIRM TRANSACTION
router.put(
  "/:id/confirm-transaction",
  protect,
  async (req, res) => {
    try {
      // FIND PRODUCT
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Produk tidak ditemukan",
        });
      }

      // ONLY SELLER CAN CONFIRM
      if (
        product.seller.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "Tidak diizinkan",
        });
      }

      // MUST HAVE PAYMENT PROOF
      if (!product.paymentSubmitted) {
        return res.status(400).json({
          message:
            "Bukti pembayaran belum diunggah",
        });
      }

      // UPDATE STATUS
      product.status =
        "completed";

      await product.save();
      await Notification.create({
        user:
          product.lastBidder,
        type:
          "transaction_completed",
        product:
          product._id,
        message:
          `Transaksi untuk ${product.title} telah selesai`,
      });

      res.status(200).json({
        message:
          "Transaksi berhasil diselesaikan",
        product,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

export default router;