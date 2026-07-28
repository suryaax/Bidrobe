import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import BidModal from "../components/BidModal";
import ProductCard from "../components/productCard";

import "./productDetail.css";

const ProductDetail = ({ onOpenAuth }) => {
  const { id } = useParams();

  const [showBid, setShowBid] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState("");

  const [
    recommendations,
    setRecommendations,
  ] = useState([]);

  const [product, setProduct] =
    useState(null);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState("");

  const [
    paymentProof,
    setPaymentProof,
  ] = useState(null);

  const token =
    localStorage.getItem("token");

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("user")
    );
  } catch (error) {
    console.error(
      "Gagal membaca data pengguna:",
      error
    );
  }

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    currentUser?.userId;

  const sellerId =
    product?.seller?._id ||
    product?.seller?.id ||
    product?.seller;

  const isOwner =
    Boolean(currentUserId) &&
    Boolean(sellerId) &&
    sellerId.toString() ===
      currentUserId.toString();

  const categoryMap = {
    Men: "Pria",
    Women: "Wanita",
    Children: "Anak",
    Unisex: "Unisex",
  };

  const formatRupiah = (value) =>
    Number(value || 0).toLocaleString(
      "id-ID"
    );

  /*
   * Fungsi ini diletakkan di luar useEffect agar
   * dapat dipanggil kembali setelah bid pertama,
   * Beli Sekarang, atau unggah bukti pembayaran.
   */
  const fetchProduct = useCallback(
    async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/products/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Gagal mengambil data produk"
          );
        }

        setProduct(data);

        setSelectedImage(
          (previousImage) => {
            if (
              previousImage &&
              data.images?.includes(
                previousImage
              )
            ) {
              return previousImage;
            }

            return data.images?.[0] || "";
          }
        );
      } catch (error) {
        console.error(
          "Fetch product error:",
          error
        );
      }
    },
    [id]
  );

  const fetchRecommendations =
    useCallback(async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/products/${id}/recommendations`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Gagal mengambil rekomendasi"
          );
        }

        setRecommendations(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Fetch recommendations error:",
          error
        );
      }
    }, [id]);

  useEffect(() => {
    fetchProduct();
    fetchRecommendations();
  }, [
    fetchProduct,
    fetchRecommendations,
  ]);

  /*
   * Countdown baru:
   * - status tidak aktif: lelang berakhir;
   * - endTime null: menunggu tawaran pertama;
   * - endTime tersedia: countdown berjalan.
   */
  useEffect(() => {
    if (!product) return undefined;

    if (product.status !== "active") {
      setTimeLeft("Lelang Berakhir");
      return undefined;
    }

    if (!product.endTime) {
      setTimeLeft(
        "Timer dimulai setelah tawaran pertama"
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
        setTimeLeft("Lelang Berakhir");
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
        (difference / (1000 * 60)) %
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

    updateCountdown();

    const interval = setInterval(() => {
      const isRunning =
        updateCountdown();

      if (!isRunning) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    product?.endTime,
    product?.status,
  ]);

  const handleProtectedBid = () => {
    if (!token) {
      onOpenAuth?.();
      return;
    }

    if (isOwner) {
      alert(
        "Anda tidak dapat mengajukan tawaran pada produk milik sendiri"
      );
      return;
    }

    setShowBid(true);
  };

  const handleBuyNow = async () => {
    if (!token) {
      onOpenAuth?.();
      return;
    }

    if (isOwner) {
      alert(
        "Anda tidak dapat membeli produk milik sendiri"
      );
      return;
    }

    const confirmBuy =
      window.confirm(
        `Beli produk ini sekarang seharga Rp ${formatRupiah(
          product.buyoutPrice
        )}?`
      );

    if (!confirmBuy) return;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/products/${id}/buy-now`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal membeli produk"
        );
      }

      alert(data.message);

      /*
       * Ambil ulang produk agar seller,
       * lastBidder, status, dan data populate
       * lainnya tetap lengkap.
       */
      await fetchProduct();
    } catch (error) {
      console.error(
        "Buy Now error:",
        error
      );

      alert(
        error.message ||
          "Gagal membeli produk"
      );
    }
  };

  const handlePaymentProof =
    async () => {
      if (!paymentProof) {
        alert(
          "Unggah bukti transaksi terlebih dahulu"
        );
        return;
      }

      try {
        const formData =
          new FormData();

        formData.append(
          "paymentProof",
          paymentProof
        );

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/products/${id}/payment-proof`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Gagal mengunggah bukti transaksi"
          );
        }

        alert(data.message);
        setPaymentProof(null);

        await fetchProduct();
      } catch (error) {
        console.error(
          "Payment proof error:",
          error
        );

        alert(
          error.message ||
            "Gagal mengunggah bukti transaksi"
        );
      }
    };

  const lastBidderId =
    product?.lastBidder?._id ||
    product?.lastBidder;

  const isWinner =
    (
      product?.status === "ended" ||
      product?.status === "sold"
    ) &&
    lastBidderId?.toString() ===
      currentUserId?.toString();

  /*
   * Tombol transaksi tetap tersedia jika:
   * - status produk masih active; dan
   * - countdown belum mencapai akhir.
   *
   * Produk dengan endTime null tetap dapat
   * menerima bid pertama atau Beli Sekarang.
   */
  const canTransact =
    product?.status === "active" &&
    timeLeft !== "Lelang Berakhir" &&
    !isOwner;

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
        {categoryMap[product.category] ||
          product.category}
        {" / "}
        {product.subCategory}
      </div>

      {/* TOP SECTION */}
      <div className="detail-top">
        {/* IMAGE */}
        <div className="detail-image">
          {selectedImage && (
            <img
              src={selectedImage}
              alt={product.title}
              className="main-detail-image"
            />
          )}

          <div className="thumbnail-list">
            {product.images?.map(
              (image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`Gambar ${
                    index + 1
                  } ${product.title}`}
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
          <h1>{product.title}</h1>

          <p className="brand">
            {product.brand}
          </p>

          <p className="price">
            Rp{" "}
            {formatRupiah(
              product.currentBid
            )}
          </p>

          <p className="buyout-price">
            Beli Sekarang:{" "}
            <span>
              Rp{" "}
              {formatRupiah(
                product.buyoutPrice
              )}
            </span>
          </p>

          <p className="timer">
            ⏳ {timeLeft}
          </p>

          {!product.endTime &&
            product.status ===
              "active" && (
              <p className="auction-note">
                Produk akan tetap tersedia
                sampai tawaran pertama masuk.
              </p>
            )}

          <p className="bidder">
            Penawar Terakhir:{" "}
            {product.lastBidder
              ?.username || "-"}
          </p>

          <p className="bidder">
            Jumlah Tawaran:{" "}
            {product.bidCount || 0}
          </p>

          {isOwner &&
            product.status ===
              "active" && (
              <p className="owner-note">
                Ini adalah produk yang Anda jual.
              </p>
            )}

          {/* QUICK BID */}
          {canTransact && (
            <>
              <button
                type="button"
                className="bid-btn"
                onClick={
                  handleProtectedBid
                }
              >
                Ajukan Tawaran
              </button>

              <button
                type="button"
                className="buyout-btn"
                onClick={handleBuyNow}
              >
                Beli Sekarang
              </button>
            </>
          )}

          {/* WHATSAPP */}
          {isWinner &&
            product.seller
              ?.phoneNumber && (
              <div className="winner-section">
                <p className="winner-note">
                  Untuk transaksi lebih
                  lanjut, harap hubungi
                  pihak penjual
                </p>

                <a
                  href={`https://wa.me/${
                    product.seller
                      .phoneNumber
                  }?text=${encodeURIComponent(
                    `Halo, saya memenangkan lelang Anda untuk produk "${product.title}" dengan harga Rp ${formatRupiah(
                      product.currentBid
                    )}. Saya ingin melanjutkan proses transaksi.`
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
                Unggah Bukti Transaksi
              </p>

              <div className="proof-actions">
                <label className="custom-proof-input">
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(event) =>
                      setPaymentProof(
                        event.target
                          .files?.[0] ||
                          null
                      )
                    }
                  />

                  <span>
                    {paymentProof
                      ? paymentProof.name
                      : "Unggah bukti pembayaran"}
                  </span>
                </label>

                <button
                  type="button"
                  className="upload-proof-btn"
                  onClick={
                    handlePaymentProof
                  }
                >
                  Kirim Bukti Transaksi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="description">
        <h3>Deskripsi</h3>
        <p>{product.description}</p>
      </div>

      {/* RECOMMENDATION */}
      <div className="recommendation-section">
        <h2>Produk Serupa</h2>

        <div className="recommendation-grid">
          {recommendations.map(
            (recommendation) => (
              <ProductCard
                key={
                  recommendation._id
                }
                product={
                  recommendation
                }
              />
            )
          )}
        </div>
      </div>

      {/* MODAL */}
      {showBid && (
        <BidModal
          product={product}
          fetchProduct={fetchProduct}
          onClose={() =>
            setShowBid(false)
          }
        />
      )}
    </div>
  );
};

export default ProductDetail;