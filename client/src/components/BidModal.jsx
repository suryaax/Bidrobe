import React, { useState } from "react";

import "./BidModal.css";

const increments = [
  10000,
  20000,
  50000,
];

const BidModal = ({
  product,
  onClose,
  fetchProduct,
}) => {

  const [bid, setBid] =
    useState("");

  const handleQuickBid = (
    amount
  ) => {

    setBid(
      product.currentBid +
      amount
    );

  };

  const handleBid = async () => {

    try {

      // VALIDATION
      if (!bid) {

        alert(
          "Harap masukkan tawaran anda!"
        );

        return;

      }

      if (
        Number(bid) <=
        product.currentBid
      ) {

        alert(
          "Tawaran harus lebih tinggi dari sebelumnya!"
        );

        return;

      }

      // SEND BID
      const response =
        await fetch(

          `${import.meta.env.VITE_API_URL}/api/products/${product._id}/bid`,

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${localStorage.getItem("token")}`,

            },

            body: JSON.stringify({

              amount:
                Number(bid),

            }),

          }

        );

      const data =
        await response.json();

      // ERROR
      if (!response.ok) {

        alert(
          data.message ||
          "Penawaran gagal!"
        );

        return;

      }

      // SUCCESS
      alert(
        "Penawaran berhasil diajukan!"
      );

      // REFRESH PRODUCT
      if (fetchProduct) {

        fetchProduct();

      }

      // CLOSE MODAL
      onClose();

    } catch (error) {

      console.log(error);

      alert(
        "Terjadi kesalahan!"
      );

    }

  };

  return (

    <div

      className="modal-overlay"

      onClick={onClose}

    >

      <div

        className="modal"

        onClick={(e) =>
          e.stopPropagation()
        }

      >

        {/* CLOSE */}
        <button

          className="close"

          onClick={onClose}

        >

          ✕

        </button>

        <div className="modal-content">

          {/* LEFT IMAGE */}
          <div className="modal-image">

            <img

              src={
                product.images?.[0]
              }

              alt={product.title}

            />

          </div>

          {/* RIGHT INFO */}
          <div className="modal-info">

            <h2 className="bid-title">

              {product.title}

            </h2>

            <p className="current-bid">

              Penawaran saat ini:

              <span>

                {" "}

                Rp {

                  product.currentBid
                  .toLocaleString()

                }

              </span>

            </p>

            {/* QUICK BID BUTTONS */}
            <div className="quick-bids">

              {increments.map(
                (amount) => (

                <button

                  key={amount}

                  onClick={() =>
                    handleQuickBid(
                      amount
                    )
                  }

                >

                  +{

                    amount
                    .toLocaleString()

                  }

                </button>

              ))}

            </div>

            {/* OR */}
            <p className="or-text">

              atau

            </p>

            {/* CUSTOM BID */}
            <input

              type="number"

              value={bid}

              onChange={(e) =>

                setBid(
                  e.target.value
                )

              }

              placeholder="Masukkan tawaran anda"

              className="bid-input"

            />

            {/* PLACE BID */}
            <button

              className="place-bid-btn"

              onClick={handleBid}

            >

              Ajukan tawaran

            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default BidModal;