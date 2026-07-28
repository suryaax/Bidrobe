import React, { useState } from "react";
import "./UploadModal.css";

const categories = [
  { value: "Men", label: "Pria" },
  { value: "Women", label: "Wanita" },
  { value: "Children", label: "Anak" },
  { value: "Unisex", label: "Unisex" },
];

const subCategories = [
  "Kaos, Kemeja & Jaket",
  "Aksesoris",
  "Celana",
  "Sepatu",
];

const UploadModal = ({
  onClose,
  onUploadSuccess,
  editProduct,
}) => {
  // IMAGE
  const [images, setImages] = useState([]);

  // FORM
  const [title, setTitle] = useState(
    editProduct?.title || ""
  );

  const [description, setDescription] = useState(
    editProduct?.description || ""
  );

  const [category, setCategory] = useState(
    editProduct?.category || ""
  );

  const [subCategory, setSubCategory] = useState(
    editProduct?.subCategory || ""
  );

  const [brand, setBrand] = useState(
    editProduct?.brand || ""
  );

  // Harga awal lelang, bukan currentBid.
  // Backend akan mengisi currentBid dengan nilai startingBid.
  const [startingBid, setStartingBid] = useState(
    editProduct?.startingBid ?? ""
  );

  const [buyoutPrice, setBuyoutPrice] = useState(
    editProduct?.buyoutPrice ?? ""
  );

  // Durasi baru dihitung setelah tawaran pertama masuk.
  const [
    auctionDurationHours,
    setAuctionDurationHours,
  ] = useState(
    editProduct?.auctionDurationHours ?? 24
  );

  const [loading, setLoading] = useState(false);

  // HANDLE IMAGE SELECT
  const handleImages = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length > 5) {
      alert("Maksimal 5 gambar");
      event.target.value = "";
      return;
    }

    setImages(selectedFiles);
  };

  // UPLOAD IMAGES TO CLOUDINARY
  const uploadImages = async () => {
    const uploadedUrls = [];

    for (const image of images) {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengunggah gambar"
        );
      }

      if (!data.imageUrl) {
        throw new Error(
          "URL gambar tidak diterima dari server"
        );
      }

      uploadedUrls.push(data.imageUrl);
    }

    return uploadedUrls;
  };

  // HANDLE PRODUCT UPLOAD / EDIT
  const handleUpload = async () => {
    const startingPriceNumber = Number(startingBid);
    const buyoutPriceNumber = Number(buyoutPrice);
    const durationNumber = Number(
      auctionDurationHours
    );

    // VALIDATION
    if (
      !title.trim() ||
      !description.trim() ||
      !category ||
      !subCategory ||
      !brand.trim() ||
      startingBid === "" ||
      buyoutPrice === "" ||
      auctionDurationHours === "" ||
      (!editProduct && images.length === 0)
    ) {
      alert("Harap isi seluruh kolom");
      return;
    }

    if (
      !Number.isFinite(startingPriceNumber) ||
      startingPriceNumber < 0
    ) {
      alert("Harga awal lelang tidak valid");
      return;
    }

    if (
      !Number.isFinite(buyoutPriceNumber) ||
      buyoutPriceNumber <= startingPriceNumber
    ) {
      alert(
        "Harga Beli Sekarang harus lebih tinggi dari harga awal lelang"
      );
      return;
    }

    if (
      !Number.isFinite(durationNumber) ||
      durationNumber < 1
    ) {
      alert("Durasi lelang minimal 1 jam");
      return;
    }

    try {
      setLoading(true);

      // Upload hanya gambar baru yang dipilih.
      const uploadedImages =
        images.length > 0
          ? await uploadImages()
          : [];

      const response = await fetch(
        editProduct
          ? `${import.meta.env.VITE_API_URL}/api/products/${editProduct._id}`
          : `${import.meta.env.VITE_API_URL}/api/products`,
        {
          method: editProduct ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            images:
              uploadedImages.length > 0
                ? uploadedImages
                : editProduct?.images || [],
            category,
            subCategory,
            brand: brand.trim(),

            // Nama field disesuaikan dengan schema baru.
            startingBid: startingPriceNumber,
            buyoutPrice: buyoutPriceNumber,
            auctionDurationHours: durationNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Produk gagal disimpan"
        );
      }

      alert(
        editProduct
          ? "Produk berhasil diperbarui!"
          : "Produk berhasil diunggah!"
      );

      if (onUploadSuccess) {
        await onUploadSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Upload product error:", error);

      alert(
        error.message || "Produk gagal disimpan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="upload-overlay"
      onClick={onClose}
    >
      <div
        className="upload-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* CLOSE */}
        <button
          type="button"
          className="close"
          onClick={onClose}
          disabled={loading}
        >
          ✕
        </button>

        {/* TITLE */}
        <h2 className="upload-title">
          {editProduct
            ? "Edit Produk"
            : "Unggah Produk"}
        </h2>

        {/* PRODUCT TITLE */}
        <input
          type="text"
          placeholder="Judul Produk"
          className="upload-input title-input"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          disabled={loading}
        />

        {/* MAIN CONTENT */}
        <div className="upload-content">
          {/* LEFT IMAGE SECTION */}
          <div className="upload-image-section">
            <label className="upload-image-box">
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImages}
                disabled={loading}
              />

              {images.length > 0 ? (
                <img
                  src={URL.createObjectURL(images[0])}
                  alt="Pratinjau produk"
                  className="preview-image"
                />
              ) : editProduct?.images?.[0] ? (
                <img
                  src={editProduct.images[0]}
                  alt="Gambar produk"
                  className="preview-image"
                />
              ) : (
                <span>Unggah Gambar</span>
              )}
            </label>

            {images.length > 0 && (
              <p className="image-count">
                {images.length} gambar dipilih
              </p>
            )}
          </div>

          {/* RIGHT FORM SECTION */}
          <div className="upload-form-section">
            {/* DESCRIPTION */}
            <textarea
              placeholder="Deskripsi Produk"
              className="upload-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={loading}
            />

            {/* CATEGORY ROW */}
            <div className="upload-row">
              <select
                className="upload-select"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                disabled={loading}
              >
                <option value="">Kategori</option>

                {categories.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                className="upload-select"
                value={subCategory}
                onChange={(event) =>
                  setSubCategory(event.target.value)
                }
                disabled={loading}
              >
                <option value="">Sub Kategori</option>

                {subCategories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* PRICE ROW */}
            <div className="upload-row">
              <input
                type="number"
                min="0"
                placeholder="Harga Awal Lelang"
                className="upload-input"
                value={startingBid}
                onChange={(event) =>
                  setStartingBid(event.target.value)
                }
                disabled={loading}
              />

              <input
                type="number"
                min="0"
                placeholder="Harga Beli Sekarang"
                className="upload-input"
                value={buyoutPrice}
                onChange={(event) =>
                  setBuyoutPrice(event.target.value)
                }
                disabled={loading}
              />
            </div>

            {/* EXTRA ROW */}
            <div className="upload-row">
              <input
                type="number"
                min="1"
                placeholder="Durasi Setelah Tawaran Pertama (jam)"
                className="upload-input"
                value={auctionDurationHours}
                onChange={(event) =>
                  setAuctionDurationHours(
                    event.target.value
                  )
                }
                disabled={loading}
              />

              <input
                type="text"
                placeholder="Merek"
                className="upload-input"
                value={brand}
                onChange={(event) =>
                  setBrand(event.target.value)
                }
                disabled={loading}
              />
            </div>

            <small className="auction-note">
              Timer lelang akan dimulai setelah tawaran pertama masuk.
            </small>
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="button"
          className="upload-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading
            ? editProduct
              ? "Menyimpan..."
              : "Mengunggah..."
            : editProduct
              ? "Simpan Perubahan"
              : "Unggah Produk"}
        </button>
      </div>
    </div>
  );
};

export default UploadModal;