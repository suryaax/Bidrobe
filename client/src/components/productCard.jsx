import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./productCard.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] =
    useState("");

  useEffect(() => {
    /*
     * Jika status produk sudah tidak aktif,
     * countdown tidak perlu dijalankan.
     */
    if (product.status !== "active") {
      setTimeLeft("Lelang Berakhir");
      return undefined;
    }

    /*
     * Produk belum menerima tawaran pertama.
     * endTime masih null sehingga timer belum berjalan.
     */
    if (!product.endTime) {
      setTimeLeft(
        "Menunggu tawaran pertama"
      );

      return undefined;
    }

    const updateCountdown = () => {
      const endTime = new Date(
        product.endTime
      ).getTime();

      const difference =
        endTime - Date.now();

      if (
        !Number.isFinite(endTime) ||
        difference <= 0
      ) {
        setTimeLeft(
          "Lelang Berakhir"
        );

        return false;
      }

      const days = Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (difference /
          (1000 * 60 * 60)) %
          24
      );

      const minutes = Math.floor(
        (difference /
          (1000 * 60)) %
          60
      );

      if (days > 0) {
        setTimeLeft(
          `${days}h ${hours}j ${minutes}m`
        );
      } else {
        setTimeLeft(
          `${hours}j ${minutes}m`
        );
      }

      return true;
    };

    // Jalankan langsung agar tidak menunggu satu detik
    updateCountdown();

    const interval = setInterval(
      () => {
        const isRunning =
          updateCountdown();

        if (!isRunning) {
          clearInterval(interval);
        }
      },
      1000
    );

    return () =>
      clearInterval(interval);
  }, [
    product.endTime,
    product.status,
  ]);

  const handleOpenProduct = (
    event
  ) => {
    event.stopPropagation();

    navigate(
      `/product/${product._id}`
    );
  };

  return (
    <div
      className="card"
      onClick={handleOpenProduct}
    >
      {/* IMAGE */}
      <div className="card-image">
        <img
          src={product.images?.[0]}
          alt={product.title}
        />
      </div>

      {/* INFO */}
      <div className="card-info">
        <p className="title">
          {product.title}
        </p>

        <p className="bid">
          Rp{" "}
          {Number(
            product.currentBid || 0
          ).toLocaleString("id-ID")}
        </p>

        <p className="timer">
          {timeLeft}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;