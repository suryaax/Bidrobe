import {
  useEffect,
  useState,
} from "react";

import Hero from "../components/hero";
import ProductCard from "../components/productCard";
import "./home.css";

const categories = [
  { value: "", label: "Semua" },
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

const Home = () => {

  const [products, setProducts] =
    useState([]);

  const [sort, setSort] =
    useState("new");

  const [category, setCategory] =
    useState("");

  const [subCategory, setSubCategory] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let url =
          `${import.meta.env.VITE_API_URL}/api/products`;
        const queryParams = [];

        if (sort) {
          queryParams.push(
            `sort=${encodeURIComponent(sort)}`
          );
        }

        if (category) {
          queryParams.push(
            `category=${encodeURIComponent(category)}`
          );
        }

        if (subCategory) {
          queryParams.push(
            `subCategory=${encodeURIComponent(subCategory)}`
          );
        }

        if (queryParams.length > 0) {
          url +=
            `?${queryParams.join("&")}`;
        }

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Produk gagal dimuat"
          );
        }

        const data =
          await response.json();

        setProducts(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.log(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sort, category, subCategory]);

  return (
    <div className="home">
      <Hero />

      <section className="recommendation container">
        <aside className="filter" aria-label="Filter produk">
          <div className="filter-group">
            <p className="filter-title">Urutkan</p>

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
          </div>

          <div className="filter-group">
            <p className="filter-title">Kategori</p>

            {categories.map((item) => (
              <button
                key={item.value || "all"}
                className={`filter-item ${
                  category === item.value
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setCategory(item.value)
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <label
              className="filter-title"
              htmlFor="subcategory-filter"
            >
              Subkategori
            </label>

            <select
              id="subcategory-filter"
              className="filter-select"
              value={subCategory}
              onChange={(event) =>
                setSubCategory(event.target.value)
              }
            >
              <option value="">Semua</option>

              {subCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {(category || subCategory) && (
            <button
              className="reset-filter"
              onClick={() => {
                setCategory("");
                setSubCategory("");
              }}
            >
              Hapus Filter
            </button>
          )}
        </aside>

        <div className="product-results">
          {loading ? (
            <p className="product-status">
              Memuat produk...
            </p>
          ) : products.length === 0 ? (
            <p className="product-status">
              Tidak ada produk yang sesuai dengan filter.
            </p>
          ) : (
            <div className="grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
