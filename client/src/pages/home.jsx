import React, {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import Hero from "../components/hero";
import ProductCard from "../components/productCard";
import "./home.css";

const Home = () => {

  const [products, setProducts] =
    useState([]);

  const [sort, setSort] =
    useState("new");

  // URL QUERY
  const [searchParams] =
    useSearchParams();

  // GET SEARCH FROM URL
  const search =
    searchParams.get("search") || "";

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url =
          '${import.meta.env.VITE_API_URL}/api/products';
        const queryParams = [];

        // SORT
        if (sort) {
          queryParams.push(
            `sort=${sort}`
          );
        }

        // SEARCH
        if (search) {
          queryParams.push(
            `search=${search}`
          );
        }

        // BUILD QUERY
        if (queryParams.length > 0) {
          url +=
            `?${queryParams.join("&")}`;
        }
        const response =
          await fetch(url);
        const data =
          await response.json();
        setProducts(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProducts();
  }, [sort, search]);

  return (
    <div className="home">
      <Hero />
      {/* RECOMMENDATION */}
      <section className="recommendation container">
        {/* SIDEBAR */}
        <aside className="filter">
          {/* HOT BID */}
          <button
            className={`filter-item ${
              sort === "hot"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSort("hot")
            }
          >
            Penawaran Hangat
          </button>

          {/* NEWLY UPLOADED */}
          <button
            className={`filter-item ${
              sort === "new"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSort("new")
            }
          >
            Baru di-Upload
          </button>

          {/* ENDING SOON */}
          <button
            className={`filter-item ${
              sort === "ending"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSort("ending")
            }
          >
            Segera Berakhir
          </button>
        </aside>

        {/* PRODUCT GRID */}
        <div className="grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
export default Home;