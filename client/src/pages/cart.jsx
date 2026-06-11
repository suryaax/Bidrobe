import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./cart.css";

const Cart = () => {

  const [biddings, setBiddings] =
    useState([]);

  const [selected, setSelected] =
    useState(null);

  const [customBid, setCustomBid] =
    useState("");
  
  const [loading, setLoading] =
    useState(false);

  const navigate =
    useNavigate();

  // 🔥 FETCH USER BIDDINGS
  const fetchBiddings = async () => {

    try {

      const response =
        await fetch(

          `${import.meta.env.VITE_API_URL}/api/products/my-bids`,

          {
            headers: {

              Authorization:
                `Bearer ${localStorage.getItem("token")}`,

            },
          }

        );

      const data =
        await response.json();

      if (!Array.isArray(data)) {
        setBiddings([]);
        setSelected(null);
        return;
      }
      setBiddings(data);

      const updatedSelected =
        data.find(
          (item) =>
            item.product._id ===
            selected?.product?._id
        );

      if (updatedSelected) {
        setSelected(
          updatedSelected
        );

      } else if (data.length > 0) {
        setSelected(
          data[0]
        );

      } else {
        setSelected(null);
      }

    } catch (error) {

      console.log(error);

    }

  };

  // 🔥 INITIAL FETCH
  useEffect(() => {
    fetchBiddings();
  }, []);

  useEffect(() => {
    if (
      biddings.length > 0 &&
      !selected
    ) {
      setSelected(
        biddings[0]
      );
    }
  }, [biddings]);

  useEffect(() => {

  const interval =
    setInterval(() => {

      fetchBiddings();

    }, 5000);

  return () =>
    clearInterval(interval);

  }, []);

  // 🔥 PLACE BID
  const handleBid = async (
  amount
) => {

  try {

    if (loading) return;

    setLoading(true);

    // VALIDATION
    if (

      amount <=
      selected.product.currentBid

    ) {

      alert(
        "Penawaran harus lebih tinggi dari sebelumnya!"
      );

      return;

    }

    const response =
      await fetch(

        `${import.meta.env.VITE_API_URL}/api/products/${selected.product._id}/bid`,

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${localStorage.getItem("token")}`,

          },

          body: JSON.stringify({
            amount,
          }),

        }

      );

    const data =
      await response.json();

    console.log(data);

    if (!response.ok) {

      alert(
        data.message ||
        "Penawaran Gagal"
      );

      return;

    }

    alert("Penawaran Berhasil!");

    // REFRESH
    await fetchBiddings();

    setCustomBid("");

  } catch (error) {

    console.log(error);

  } finally {

    setLoading(false);

  }

  };

  // 🔥 LOADING EMPTY
  if (!selected) {

    return (

      <div className="cart-page container">

        <h2>
          Kamu belum menawar apapun
        </h2>

      </div>

    );

  }

  // 🔥 STATUS FROM BACKEND
  const status =
  selected?.status ||
  selected?.product?.status;

  return (

    <div className="cart-page container">

      {/* LEFT */}
      <div className="cart-items">

        <h2 className="cart-title">
          Tawaran Kamu
        </h2>

        {biddings.map((item) => {

          // 🔥 STATUS FROM BACKEND
          const itemStatus =
            item.status;

          return (

            <div
              key={item.product._id}
              className={`cart-item ${
                selected?.product?._id ===
                item.product._id
                  ? "active"
                  : ""
              }`}

              onMouseEnter={() =>
                setSelected(item)
              }

              onClick={() =>
                navigate(
                  `/product/${item.product._id}`
                )
              }
            >

              <img
                src={
                  item.product.images?.[0]
                }
                alt={item.product.title}
              />

              <div className="cart-item-info">

                <h4>
                  {item.product.title}
                </h4>

                <p>

                  Your Bid:
                  {" "}

                  Rp {
                    item.yourBid.toLocaleString()
                  }

                </p>

                <span
                  className={`status ${itemStatus}`}
                >

                  {itemStatus}

                </span>

                {itemStatus === "won" && (
                  <p className="winner-hint">
                    Klik produk untuk lanjut transaksi
                  </p>
                )}

              </div>

            </div>

          );

        })}

      </div>

      {/* RIGHT */}
      <div className="order-review">

        <div className="review-top">

          <h2>
            Tinjauan Penawaran
          </h2>

          <span>

            Tawaran Terakhir:
            {" "}

            Rp {
              selected.product.currentBid
                .toLocaleString()
            }

          </span>

        </div>

        <div className="review-info">

          <p className="review-label">
            Penawar Terakhir
          </p>

          <div className="review-box">

            {
              selected.product.lastBidder
                ?.username || "-"
            }

          </div>

        </div>

        {/* ACTIVE */}
        {status === "active" && (

          <>

            <div className="review-info">

              <p className="review-label">
                Naikkan penawaran
              </p>

              <div className="quick-bids">

                <button
                  onClick={() =>
                    handleBid(
                      selected.product.currentBid + 10000
                    )
                  }
                >
                  +10K
                </button>

                <button
                  onClick={() =>
                    handleBid(
                      selected.product.currentBid + 20000
                    )
                  }
                >
                  +20K
                </button>

              </div>

            </div>

            <p className="or-text">
              atau
            </p>

            <input

              type="number"

              placeholder="Penawaran Khusus"

              className="bid-input"

              value={customBid}

              onChange={(e) =>
                setCustomBid(
                  e.target.value
                )
              }

            />

            <button

              className="place-bid-btn"
              disabled={loading}

              onClick={() =>
                handleBid(
                  Number(customBid)
                )
              }
            >

              {
                loading
                  ? "Processing..."
                  : "Ajukan Penawaran"
              }

            </button>

          </>

        )}

        {/* LOST */}
        {status === "lost" && (

          <div className="result-box lost-box">

            <p>
              Kamu kalah dalam lelang ini.
            </p>

          </div>

        )}

        {/* WON */}
        {status === "won" &&
          (
            selected.product.status === "ended" ||
            selected.product.status === "sold" ||
            selected.product.status === "completed"
          ) && (

          <div className="result-box won-box">

            <p>
              Kamu memenangkan lelang ini!
            </p>

            <p className="won-desc">
              Lanjutkan transaksi dengan penjual melalui tombol whatsapp di bawah atau di dalam halaman produk, lalu klik produk untuk masuk ke halaman produk dan mengunggah bukti transaksi.
            </p>

            <a
              href={`https://wa.me/${selected.product.seller?.phoneNumber}?text=${encodeURIComponent(
                `Halo, Saya memenangkan lelang kamu ${selected.product.title} dengan harga Rp ${selected.product.currentBid.toLocaleString()}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="wa-btn"
            >
              Lanjutkan ke WhatsApp
            </a>

          </div>

        )}

      </div>

    </div>

  );

};

export default Cart;