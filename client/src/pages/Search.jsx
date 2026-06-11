import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import ProductCard
from "../components/productCard";

import "./search.css";

const Search = () => {

  const [products,
    setProducts] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [searchParams] =
    useSearchParams();

  const query =
    searchParams.get("q");

  useEffect(() => {

    const fetchSearch =
      async () => {

        try {

          setLoading(true);

          const response =
            await fetch(

              `${import.meta.env.VITE_API_URL}/api/products/search?q=${encodeURIComponent(query)}`

            );

          const data =
            await response.json();

          setProducts(data);

        } catch (error) {

          console.log(error);

        } finally {

          setLoading(false);

        }

      };

    if (query) {

      fetchSearch();

    }

  }, [query]);

  return (

    <div className="container search-page">

      <h2 className="search-title">

        Hasil pencarian:
        {" "}
        "{query}"

      </h2>

      {!loading && (

        <p className="search-count">

          {products.length}
          {" "}
          produk ditemukan

        </p>

      )}

      {loading ? (

        <p>
          Mencari produk...
        </p>

      ) : products.length === 0 ? (

        <div className="empty-search">

          <h3>
            Produk tidak ditemukan
          </h3>

          <p>
            Coba gunakan kata kunci lain
          </p>

        </div>

      ) : (

        <div className="search-grid">

          {products.map(
            (product) => (

              <ProductCard

                key={product._id}

                product={product}

              />

            )
          )}

        </div>

      )}

    </div>

  );

};

export default Search;