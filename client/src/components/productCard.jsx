import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./productCard.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate(); // ✅ HARUS DI DALAM COMPONENT

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(product.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [product.endTime]);

  return (
    <div
      className="card"
      onClick={(e) => {
        e.stopPropagation(); // 🔥 penting
        navigate(`/product/${product._id}`);
      }}
    >
      
      {/* IMAGE */}
      <div className="card-image">
        <img src={product.images?.[0]} alt={product.title} />
      </div>

      {/* INFO */}
      <div className="card-info">
        <p className="title">{product.title}</p>

        <p className="bid">
          Rp {product.currentBid.toLocaleString()}
        </p>

        <p className="timer">{timeLeft}</p>
      </div>

    </div>
  );
};

export default ProductCard;