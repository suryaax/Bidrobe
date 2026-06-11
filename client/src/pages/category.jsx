import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import ProductCard
from "../components/productCard";

import "./category.css";

const subCategories = [

  "Kaos, Kemeja & Jaket",

  "Aksesoris",

  "Celana",

  "Sepatu",

];

const categoryLabels = {
  Men: "Pria",
  Women: "Wanita",
  Children: "Anak",
  Unisex: "Unisex",
};

const Category = () => {

  const { category } =
    useParams();

  const [products, setProducts] =
    useState([]);

  const [selectedSub,
    setSelectedSub] =
    useState("");

  // FETCH PRODUCTS
  useEffect(() => {

    const fetchProducts = async () => {

      try {

        let url =
          `${import.meta.env.VITE_API_URL}/api/products`;

        const queryParams = [];

        // CATEGORY
        if (category) {

          queryParams.push(
            `category=${encodeURIComponent(category)}`
          );

        }

        // SUB CATEGORY
        if (selectedSub) {

          queryParams.push(

            `subCategory=${encodeURIComponent(selectedSub)}`

          );

        }

        // BUILD URL
        if (queryParams.length > 0) {

          url +=
            `?${queryParams.join("&")}`;

        }

        const response =
          await fetch(url);

        const data =
          await response.json();

        // SAFETY
        setProducts(

          Array.isArray(data)
            ? data
            : []

        );

      } catch (error) {

        console.log(error);

        setProducts([]);

      }

    };

    fetchProducts();

  }, [category, selectedSub]);

  return (

    <div className="category-page container">

      {/* TOP CATEGORY */}
      <div className="category-header">

        <span>
          {categoryLabels[category] ||
            category ||
            "Produk"}
        </span>

        <span>/</span>

        <span>
          {selectedSub || "Semua"}
        </span>

      </div>

      <div className="category-layout">

        {/* SIDEBAR */}
        <aside className="category-sidebar">

          {/* ALL */}
          <button

            className={
              selectedSub === ""
                ? "active"
                : ""
            }

            onClick={() =>
              setSelectedSub("")
            }

          >

            Semua

          </button>

          {/* SUB CATEGORIES */}
          {subCategories.map((sub) => (

            <button

              key={sub}

              className={

                selectedSub === sub
                  ? "active"
                  : ""

              }

              onClick={() =>
                setSelectedSub(sub)
              }

            >

              {sub}

            </button>

          ))}

        </aside>

        {/* PRODUCT GRID */}
        <div className="category-grid">

          {Array.isArray(products) &&

            products.map((product) => (

              <ProductCard

                key={product._id}

                product={product}

              />

            ))

          }

        </div>

      </div>

    </div>

  );

};

export default Category;