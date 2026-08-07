import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import logoIcon from "../assets/images/logo.svg";
import "./navbar.css";

const Navbar = () => {
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);
  const navRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  // Navbar menghilang saat scroll turun dan muncul saat scroll naik.
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (
        currentScrollY > lastScrollY.current &&
        currentScrollY > 50
      ) {
        setShow(false);
      } else {
        setShow(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  // Saat berpindah halaman, tampilkan navbar dan hitung ulang tingginya.
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const showFrame = window.requestAnimationFrame(
      () => setShow(true)
    );

    const updateHeight = () => {
      if (!navRef.current) return;

      document.documentElement.style.setProperty(
        "--navbar-height",
        `${navRef.current.offsetHeight}px`
      );
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      window.cancelAnimationFrame(showFrame);
      window.removeEventListener("resize", updateHeight);
    };
  }, [isHome]);

  const homeMenu = [
    { label: "Produk-mu", path: "/my-products" },
    { label: "Riwayat", path: "/cart" },
    { label: "Tentang", path: "/about" },
    { label: "Akun", path: "/profile" },
  ];

  return (
    <nav
      ref={navRef}
      className={`navbar ${
        isHome ? "navbar-home" : "navbar-minimal"
      } ${show ? "show" : "hide"}`}
      aria-label={
        isHome
          ? "Navigasi utama Bidrobe"
          : "Kembali ke Beranda"
      }
    >
      <div className="container navbar-container">
        <div className="navbar-top">
          <button
            className="logo-btn"
            onClick={() => navigate("/")}
            aria-label="Kembali ke Beranda"
          >
            <img src={logoIcon} alt="Bidrobe" />
          </button>
        </div>

        {isHome && (
          <div className="navbar-bottom">
            <ul className="menu">
              {homeMenu.map((item) => (
                <li key={item.path}>
                  <button
                    className="menu-btn"
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
