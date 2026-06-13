import React, {
  useState,
  useEffect,
} from "react";

import {
  useParams,
} from "react-router-dom";

import BidModal
from "../components/BidModal";

import "./productDetail.css";

import ProductCard
from "../components/productCard";

const ProductDetail = ({onOpenAuth, }) => {
  const { id } =
    useParams();

  const [showBid, setShowBid] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState("");
  
  const [
    recommendations,
    setRecommendations,
  ] = useState([]);

  // 🔥 REAL PRODUCT STATE
  const [product, setProduct] =
    useState(null);

  // 🔥 SELECTED IMAGE
  const [selectedImage,
    setSelectedImage] =
    useState("");

  const currentUser =
  JSON.parse(
    localStorage.getItem("user")
  );
  const token =
  localStorage.getItem("token");

  const handleProtectedBid = () => {
    if (!token) {
      onOpenAuth();
      return;
    }
    setShowBid(true);
  };

  const categoryMap = {
    Men: "Pria",
    Women: "Wanita",
    Children: "Anak",
    Unisex: "Unisex",
  };

  const handleBuyNow =
  async () => {
    if (!token) {
      onOpenAuth();
      return;
    }

    const confirmBuy =
      window.confirm(
        `Beli produk ini sekarang seharga Rp ${product.buyoutPrice.toLocaleString()} ?`
      );

    if (!confirmBuy) return;
    try {
      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${id}/buy-now`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();
      alert(data.message);
      setProduct(data.product);
    } catch (error) {
      console.log(error);
    }
  };

  const isWinner =
  (
    product?.status === "ended" ||
    product?.status === "sold"
  ) &&
  product?.lastBidder?._id?.toString() ===
  currentUser?.id?.toString();

  const [paymentProof,
  setPaymentProof] =
  useState(null);

  const handlePaymentProof =
  async () => {

    try {

      if (!paymentProof) {

        alert(
          "Upload bukti transaksi terlebih dahulu"
        );

        return;

      }

      const formData =
        new FormData();

      formData.append(
        "paymentProof",
        paymentProof
      );

      const response =
        await fetch(

          `${import.meta.env.VITE_API_URL}/api/products/${id}/payment-proof`,

          {

            method: "PUT",

            headers: {

              Authorization:
                `Bearer ${token}`,

            },

            body: formData,

          }

        );

      const data =
        await response.json();

      alert(data.message);

      // REFRESH PRODUCT
      setProduct(data.product);

    } catch (error) {

      console.log(error);

      alert(
        "Gagal mengunggah bukti transaksi"
      );

    }

  };

  // 🔥 FETCH PRODUCT
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/products/${id}`
          );
        const data =
          await response.json();
        setProduct(data);
        setSelectedImage(
          data.images?.[0]
        );
      } catch (error) {
        console.log(error);
      }
    };
    const fetchRecommendations =
      async () => {
        try {
          const response =
            await fetch(
              `${import.meta.env.VITE_API_URL}/api/products/${id}/recommendations`
            );
          const data =
            await response.json();
          setRecommendations(data);
        } catch (error) {
          console.log(error);
        }
      };
    fetchProduct();
    fetchRecommendations();
  }, [id]);

  // 🔥 COUNTDOWN
  useEffect(() => {
    if (!product) return;
    if (
      product.status === "sold" ||
      product.status === "completed"
    ) {
      setTimeLeft(
        "Lelang Berakhir"
      );
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff =
        new Date(product.endTime) - now;
      if (diff <= 0) {
        setTimeLeft("Lelang Berakhir");
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(
        diff / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (diff / (1000 * 60)) % 60
      );
      setTimeLeft(
        `${hours}h ${minutes}m`
      );
    }, 1000);
    return () =>
      clearInterval(interval);
  }, [product]);

  // 🔥 LOADING
  if (!product) {
    return (
      <div className="container">
        Memuat...
      </div>
    );
  }

  return (
    <div className="container product-detail">
      {/* CATEGORY */}
      <div className="meta">
        {
          categoryMap[
            product.category
          ] ||
          product.category
        }
        {" / "}
        {product.subCategory}
      </div>

      {/* TOP SECTION */}
      <div className="detail-top">
        {/* IMAGE */}
        <div className="detail-image">
          {/* MAIN IMAGE */}
          <img
            src={selectedImage}
            alt={product.title}
            className="main-detail-image"
          />

          {/* THUMBNAILS */}
          <div className="thumbnail-list">
            {product.images?.map(
              (image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="thumbnail"
                  className={
                    selectedImage === image
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSelectedImage(image)
                  }
                />
              )
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="detail-info">
          <h1>
            {product.title}
          </h1>

          <p className="brand">
            {product.brand}
          </p>

          <p className="price">
            Rp {
              product.currentBid
                .toLocaleString()
            }
          </p>

          <p className="buyout-price">
            Beli Sekarang:
            {" "}
            <span>
              Rp {
                product.buyoutPrice
                  ?.toLocaleString()
              }
            </span>
          </p>

          <p className="timer">
            ⏳ {timeLeft}
          </p>

          <p className="bidder">
            Penawar Terakhir:
            {" "}
            {
              product.lastBidder
                ?.username || "-"
            }
          </p>

          <p className="bidder">
            Jumlah Tawaran:
            {" "}
            {product.bidCount}
          </p>

          {/* QUICK BID */}
          {product.status === "active" && (
            <>
              {/* PLACE BID */}
              <button
                className="bid-btn"
                onClick={handleProtectedBid}
              >
                Ajukan Tawaran
              </button>

              <button
                className="buyout-btn"
                onClick={handleBuyNow}
              >
                Beli Sekarang
              </button>
            </>
          )}

          {/* WHATSAPP */}
          {isWinner && product.seller?.phoneNumber && (
            <div className="winner-section">
              <p className="winner-note">
                Untuk transaksi lebih lanjut, harap hubungi pihak penjual
              </p>
              <a
                href={`https://wa.me/${product.seller.phoneNumber}?text=${encodeURIComponent(
                  `Halo, Saya memenangkan lelang Anda untuk produk "${product.title}" dengan harga Rp ${product.currentBid.toLocaleString()}. Saya ingin melanjutkan proses transaksi.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="contact-btn"
              >
                Kontak Penjual
              </a>
            </div>
          )}
          {isWinner && (
            <div className="payment-proof">
              <p>
                Upload Bukti Transaksi
              </p>
              <div className="proof-actions">
                <label className="custom-proof-input">
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      setPaymentProof(
                        e.target.files[0]
                      )
                    }
                  />
                  <span>
                    {
                      paymentProof
                        ? paymentProof.name
                        : "Upload Payment Proof"
                    }
                  </span>
                </label>
                <button
                  className="upload-proof-btn"
                  onClick={
                    handlePaymentProof
                  }
                >
                  Submit Bukti Transaksi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="description">
        <h3>
          Deskripsi
        </h3>
        <p>
          {product.description}
        </p>
      </div>

      {/* RECOMMENDATION */}
      <div className="recommendation-section">
        <h2>
          Produk Serupa
        </h2>

        <div className="recommendation-grid">
          {recommendations.map(
            (product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            )
          )}
        </div>
      </div>

      {/* MODAL */}
      {showBid && (
        <BidModal
          product={product}
          onClose={() =>
            setShowBid(false)
          }
        />
      )}
    </div>
  );
};

export default ProductDetail;