import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import ProductCard
from "../components/productCard";

import UploadModal
from "../components/UploadModal";

import "./products.css";

const Products = () => {

  const [products, setProducts] =
    useState([]);

  const [showUpload,
    setShowUpload] =
    useState(false);

  // 🔥 EDIT PRODUCT STATE
  const [editProduct,
    setEditProduct] =
    useState(null);

  const navigate =
    useNavigate();

  // 🔥 FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const token =
        localStorage.getItem("token");

      // BELUM LOGIN
      if (!token) {
        navigate("/");
        return;
      }

      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/my-products`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      // TOKEN INVALID
      if (!response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        return;
      }

      const data =
        await response.json();

      // PASTIKAN ARRAY
      if (!Array.isArray(data)) {
        setProducts([]);
        return;
      }
      setProducts(data);
    } catch (error) {
      console.log(error);
      setProducts([]);
    }
  };

  // 🔥 DELETE PRODUCT
  const handleDelete = async (id) => {

    try {

      const confirmDelete =
        window.confirm(
          "Hapus produk ini?"
        );

      if (!confirmDelete) return;

      const response =
        await fetch(

          `${import.meta.env.VITE_API_URL}/api/products/${id}`,

          {

            method: "DELETE",

            headers: {

              Authorization:
                `Bearer ${localStorage.getItem("token")}`,

            },

          }

        );

      const data =
        await response.json();

      alert(data.message);

      // REMOVE FROM UI
      setProducts(

        products.filter(
          (product) =>
            product._id !== id
        )

      );

    } catch (error) {

      console.log(error);

    }

  };

  const handleConfirmTransaction =
    async (id) => {
      try {
        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/products/${id}/confirm-transaction`,
            {
              method: "PUT",
              headers: {
                Authorization:
                  `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

        const data =
          await response.json();

        alert(data.message);
        fetchProducts();

      } catch (error) {
        console.log(error);
      }
  };

  // 🔥 INITIAL FETCH
  useEffect(() => {

    fetchProducts();

  }, []);

  return (

    <div className="container products-page">

      {/* TITLE */}
      <h2>
        Produk-mu
      </h2>

      {/* GRID */}
      <div className="products-grid">

        {Array.isArray(products) &&
          products.map((product) => (

          <div
            key={product._id}
            className="seller-product-wrapper"
          >

            {/* PRODUCT CARD */}
            <ProductCard
              product={product}
            />

            {/* TRANSACTION BOX */}
            {(product.status === "ended" ||
              product.status === "sold") && (

              <div className="transaction-box">

                {/* WINNER */}
                <div className="transaction-row">

                  <span className="label">
                    Pemenang
                  </span>

                  <span className="value">

                    {
                      product.lastBidder
                        ?.username || "-"
                    }

                  </span>

                </div>

                {/* WAITING */}
                {!product.paymentProof && (

                  <p className="waiting-payment">

                    Menunggu bukti pembayaran

                  </p>

                )}

                {/* PAYMENT SUBMITTED */}
                {product.paymentProof && (

                  <div className="proof-section">

                    <p className="proof-success">

                      Bukti pembayaran sudah dikirim

                    </p>

                    <div className="proof-actions">

                      <a

                        href={product.paymentProof}

                        target="_blank"

                        rel="noreferrer"

                        className="view-proof-btn"

                      >

                        Lihat Bukti

                      </a>

                      {!product.transactionCompleted && (

                        <button

                          className="complete-btn"

                          onClick={() =>
                            handleConfirmTransaction(
                              product._id
                            )
                          }

                        >

                          Selesaikan

                        </button>

                      )}

                    </div>

                    {product.transactionCompleted && (

                      <p className="completed-text">

                        Transaksi selesai

                      </p>

                    )}

                  </div>

                )}

              </div>

            )}

            {/* ACTIONS */}
            <div className="product-actions">

              <button

                className="edit-btn"

                onClick={() => {

                  setEditProduct(product);

                  setShowUpload(true);

                }}

              >

                Sunting

              </button>

              <button

                className="delete-btn"

                onClick={() =>
                  handleDelete(product._id)
                }

              >

                Hapus

              </button>

            </div>

          </div>

        ))}

      </div>

      {/* FLOATING BUTTON */}
      <button

        className="fab"

        onClick={() => {

          setEditProduct(null);

          setShowUpload(true);

        }}
      >

        +

      </button>

      {/* MODAL */}
      {showUpload && (

        <UploadModal

          onClose={() => {

            setShowUpload(false);

            setEditProduct(null);

          }}

          onUploadSuccess={
            fetchProducts
          }

          editProduct={
            editProduct
          }

        />

      )}

    </div>

  );

};


export default Products;