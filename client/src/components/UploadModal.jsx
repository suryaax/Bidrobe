import React, { useState } from "react";
import "./UploadModal.css";

const categories = [
  {
    value: "Men",
    label: "Pria",
  },
  {
    value: "Women",
    label: "Wanita",
  },
  {
    value: "Children",
    label: "Anak",
  },
  {
    value: "Unisex",
    label: "Unisex",
  },
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
  const [images, setImages] =
    useState([]);

  // FORM
  const [title, setTitle] =
  useState(
    editProduct?.title || ""
  );

  const [description,
  setDescription] =
  useState(
    editProduct?.description || ""
  );

  const [category,
  setCategory] =
  useState(
    editProduct?.category || ""
  );

  const [subCategory,
  setSubCategory] =
  useState(
    editProduct?.subCategory || ""
  );

  const [brand, setBrand] =
  useState(
    editProduct?.brand || ""
  );

  const [currentBid,
  setCurrentBid] =
  useState(
    editProduct?.currentBid || ""
  );

  const [buyoutPrice,
  setBuyoutPrice] =
  useState(
    editProduct?.buyoutPrice || ""
  );

  const [durationHours,
    setDurationHours] =
    useState(24);

  const [loading, setLoading] =
    useState(false);

  // HANDLE IMAGE SELECT
  const handleImages = (e) => {

    // MAX 5 IMAGES
    if (e.target.files.length > 5) {

      alert("Maximal 5 gambar");

      return;

    }

    setImages([
      ...e.target.files
    ]);

  };

  // UPLOAD IMAGES TO CLOUDINARY
  const uploadImages = async () => {

    const uploadedUrls = [];

    for (const image of images) {

      const formData =
        new FormData();

      formData.append(
        "image",
        image
      );

      const response =
        await fetch(

          `${import.meta.env.VITE_API_URL}/api/products/upload-image`,

          {
            method: "POST",

            headers: {

              Authorization:
                `Bearer ${localStorage.getItem("token")}`,

            },

            body: formData,
          }

        );

      const data =
        await response.json();

      uploadedUrls.push(
        data.imageUrl
      );

    }

    return uploadedUrls;

  };

  // HANDLE PRODUCT UPLOAD
  const handleUpload = async () => {

    // VALIDATION
    if (
      !title ||
      !description ||
      !category ||
      !subCategory ||
      !brand ||
      !currentBid ||
      (
        !editProduct &&
        images.length === 0
      )
    ) {

      alert(
        "Harap isi seluruh kolom"
      );

      return;

    }

    try {

      setLoading(true);

      // UPLOAD IMAGES
      const uploadedImages =
        await uploadImages();

      // CREATE PRODUCT
      // CREATE / EDIT PRODUCT
      const response =
        await fetch(

          editProduct

            ? `${import.meta.env.VITE_API_URL}/api/products/${editProduct._id}`

            : `${import.meta.env.VITE_API_URL}/api/products`,

          {

            method:
              editProduct
                ? "PUT"
                : "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${localStorage.getItem("token")}`,

            },

            body: JSON.stringify({

              title,

              description,

              images:

                uploadedImages.length > 0

                  ? uploadedImages

                  : editProduct?.images || [],

              category,

              subCategory,

              brand,

              currentBid:
                Number(currentBid),

              buyoutPrice:
                Number(buyoutPrice),

              durationHours:
                Number(durationHours),

            }),

          }

        );

      const data =
        await response.json();

      console.log(data);

      alert(
        "Produk berhasil diunggah!"
      );

      // REFRESH PARENT PRODUCTS
      if (onUploadSuccess) {

        onUploadSuccess();

      }

      onClose();

    } catch (error) {

      console.log(error);

      alert("Unggahan gagal");

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

        {/* TITLE */}
        <h2 className="upload-title">

          Unggah Produk

        </h2>

        {/* PRODUCT TITLE */}
        <input
          type="text"

          placeholder="Judul Produk"

          className="upload-input title-input"

          value={title}

          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        />

        {/* MAIN CONTENT */}
        <div className="upload-content">

          {/* LEFT IMAGE SECTION */}
          <div className="upload-image-section">

            <label className="upload-image-box">

              <input
                type="file"
                multiple
                hidden
                onChange={handleImages}
              />

              {images.length > 0 ? (

                <img

                  src={URL.createObjectURL(images[0])}

                  alt="preview"

                  className="preview-image"

                />

              ) : (

                <span>
                  Unggah Gambar
                </span>

              )}

            </label>

            {/* IMAGE COUNT */}
            {images.length > 0 && (

              <p className="image-count">

                {images.length}
                {" "}
                image(s) selected

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

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

            />

            {/* CATEGORY ROW */}
            <div className="upload-row">

              {/* CATEGORY */}
              <select
                className="upload-select"

                value={category}

                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Kategori
                </option>

                {categories.map((c) => (
                  <option
                    key={c.value}
                    value={c.value}
                  >
                    {c.label}
                  </option>
                ))}

              </select>

              {/* SUB CATEGORY */}
              <select
                className="upload-select"

                value={subCategory}

                onChange={(e) =>
                  setSubCategory(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Sub Kategori
                </option>

                {subCategories.map((sub) => (

                  <option key={sub}>
                    {sub}
                  </option>

                ))}

              </select>

            </div>

            {/* PRICE ROW */}
            <div className="upload-row">

              <input
                type="number"

                placeholder="Harga awal"

                className="upload-input"

                value={currentBid}

                onChange={(e) =>
                  setCurrentBid(
                    e.target.value
                  )
                }
              />

              <input
                type="number"

                placeholder="Harga beli"

                className="upload-input"

                value={buyoutPrice}

                onChange={(e) =>
                  setBuyoutPrice(
                    e.target.value
                  )
                }
              />

            </div>

            {/* EXTRA ROW */}
            <div className="upload-row">

              <input
                type="number"
                min="1"

                placeholder="Durasi Lelang (jam)"

                className="upload-input"

                value={durationHours}

                onChange={(e) =>
                  setDurationHours(
                    e.target.value
                  )
                }
              />

              <input
                type="text"

                placeholder="Merek"

                className="upload-input"

                value={brand}

                onChange={(e) =>
                  setBrand(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

        </div>

        {/* BUTTON */}
        <button
          className="upload-btn"
          onClick={handleUpload}
        >

          {loading
            ? "Mengunggah..."
            : "Unggah Produk"}

        </button>

      </div>

    </div>

  );

};

export default UploadModal;