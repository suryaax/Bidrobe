import {
  useEffect,
  useState,
} from "react";

import Hero from "../components/hero";
import ProductCard from "../components/productCard";
import "./home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products`
        );

        if (!response.ok) {
          throw new Error("Produk gagal dimuat");
        }

        const data = await response.json();

        setProducts(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home">
      <Hero />

      <section
        id="recommendation"
        className="recommendation container"
        aria-label="Daftar produk"
      >
        {loading ? (
          <p className="product-status">
            Memuat produk...
          </p>
        ) : products.length === 0 ? (
          <p className="product-status">
            Belum ada produk yang tersedia.
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
      </section>
    </div>
  );
};

export default Home;
