import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Bell,
  ClipboardList,
  Search,
  User,
} from "lucide-react";

import logoIcon from "../assets/images/logo.svg";
import "./navbar.css";

const Navbar = () => {
  const [show, setShow] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  const lastScrollY = useRef(0);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

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

  // Data utilitas hanya diperlukan oleh navbar lengkap di Beranda.
  useEffect(() => {
    if (!isHome) return undefined;

    const controller = new AbortController();
    const token = localStorage.getItem("token");

    const fetchNavbarData = async () => {
      try {
        const [notificationResponse, historyResponse] =
          await Promise.all([
            fetch(
              `${import.meta.env.VITE_API_URL}/api/products/notifications`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
              }
            ),
            fetch(
              `${import.meta.env.VITE_API_URL}/api/products/my-bids`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
              }
            ),
          ]);

        const notificationData = notificationResponse.ok
          ? await notificationResponse.json()
          : [];
        const historyData = historyResponse.ok
          ? await historyResponse.json()
          : [];

        setNotifications(
          Array.isArray(notificationData)
            ? notificationData
            : []
        );

        setHistoryCount(
          Array.isArray(historyData)
            ? historyData.filter(
                (item) =>
                  item.product?.status === "active"
              ).length
            : 0
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Data navbar gagal dimuat:",
            error
          );
          setNotifications([]);
          setHistoryCount(0);
        }
      }
    };

    fetchNavbarData();

    return () => controller.abort();
  }, [isHome]);

  // Tutup panel utilitas ketika pengguna menekan area lain.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showSearch &&
        !searchRef.current?.contains(event.target) &&
        !event.target.closest(".search-btn")
      ) {
        setShowSearch(false);
      }

      if (
        showNotifications &&
        !notificationsRef.current?.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () =>
      document.removeEventListener(
        "click",
        handleClickOutside
      );
  }, [showNotifications, showSearch]);

  const handleSearch = () => {
    const query = searchInput.trim();

    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowSearch(false);
    setSearchInput("");
  };

  const toggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);

    if (!nextState || unreadCount === 0) return;

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(
        "Notifikasi gagal ditandai sudah dibaca:",
        error
      );
    }
  };

  const homeMenu = [
    { label: "Produk-mu", path: "/my-products" },
    { label: "Beranda", path: "/" },
    { label: "Tentang", path: "/about" },
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
          {isHome && (
            <div className="nav-left">
              <button
                className="icon-btn"
                onClick={() => navigate("/profile")}
                aria-label="Buka akun"
                title="Akun"
              >
                <User size={24} strokeWidth={2} />
              </button>
            </div>
          )}

          <button
            className="logo-btn"
            onClick={() => navigate("/")}
            aria-label="Kembali ke Beranda"
          >
            <img src={logoIcon} alt="Bidrobe" />
          </button>

          {isHome && (
            <div className="nav-right">
              <button
                className="icon-btn search-btn"
                onClick={() => setShowSearch(true)}
                aria-label="Cari produk"
                title="Pencarian"
              >
                <Search size={24} strokeWidth={2} />
              </button>

              <div
                className="utility-wrapper"
                ref={notificationsRef}
              >
                <button
                  className="icon-btn"
                  onClick={toggleNotifications}
                  aria-label="Buka notifikasi"
                  title="Notifikasi"
                >
                  <Bell size={24} strokeWidth={2} />
                </button>

                {unreadCount > 0 && (
                  <span className="utility-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}

                {showNotifications && (
                  <div className="notif-dropdown">
                    {notifications.length === 0 ? (
                      <p className="empty-notif">
                        Tidak ada notifikasi
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification._id}
                          className="notif-item"
                          onClick={() => {
                            navigate("/cart");
                            setShowNotifications(false);
                          }}
                        >
                          {notification.message}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="utility-wrapper">
                <button
                  className="icon-btn"
                  onClick={() => navigate("/cart")}
                  aria-label="Buka riwayat penawaran"
                  title="Riwayat penawaran"
                >
                  <ClipboardList
                    size={24}
                    strokeWidth={2}
                  />
                </button>

                {historyCount > 0 && (
                  <span className="utility-badge">
                    {historyCount > 9 ? "9+" : historyCount}
                  </span>
                )}
              </div>
            </div>
          )}
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

        {isHome && showSearch && (
          <div className="search-overlay" ref={searchRef}>
            <input
              type="search"
              placeholder="Cari produk, merek, dan lainnya..."
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              autoFocus
            />

            <button
              className="search-close"
              onClick={() => setShowSearch(false)}
              aria-label="Tutup pencarian"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
