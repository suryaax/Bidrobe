import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import "./navbar.css";

import {
  useNavigate,
} from "react-router-dom";

import logoIcon from "../assets/images/logo.svg"

import {
  Search,
  ClipboardList,
  Bell,
  User,
} from "lucide-react"

const Navbar = ({ onOpenAuth, isLoggedIn, }) => {

  const [show, setShow] =
    useState(true);

  const [lastScrollY, setLastScrollY] =
    useState(0);

  const [cartCount, setCartCount] =
    useState(0);

  // SEARCH
  const [showSearch, setShowSearch] =
    useState(false);

  const [searchInput, setSearchInput] =
    useState("");

  // NOTIFICATIONS
  const [notifications, setNotifications] =
    useState([]);

  const [showNotifications,
    setShowNotifications] =
    useState(false);

  const navRef = useRef(null);

  const searchRef = useRef(null);

  const menuScrollRef = useRef(null);

  const navigate = useNavigate();

  const handleProtectedRoute = (path) => {

  if (!isLoggedIn) {

    onOpenAuth();

    return;

  }

  navigate(path);

  };

  // FETCH NOTIFICATIONS
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token =
          localStorage.getItem("token");
        if (!token) {
          setNotifications([]);
          return;
        }

        const response = await fetch(
          '${import.meta.env.VITE_API_URL}/api/products/notifications',
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setNotifications([]);
          return;
        }

        const data =
          await response.json();
        if (!Array.isArray(data)) {
          setNotifications([]);
          return;
        }
        setNotifications(data);
      } catch (error) {
        console.log(error);
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [isLoggedIn]);

  // UNREAD COUNT
  const unreadCount =

    notifications.filter(
      (notif) => !notif.isRead
    ).length;

  // SEARCH FUNCTION
  const handleSearch = () => {
    if (
      !searchInput.trim()
    ) return;

    navigate(
      `/search?q=${encodeURIComponent(
        searchInput
      )}`
    );
    setShowSearch(false);
    setSearchInput("");
  };

  // SCROLL HIDE/SHOW
  useEffect(() => {

    const handleScroll = () => {

      const currentScrollY =
        window.scrollY;

      if (
        currentScrollY > lastScrollY &&
        currentScrollY > 50
      ) {

        setShow(false);

      } else {

        setShow(true);

      }

      setLastScrollY(currentScrollY);

    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, [lastScrollY]);

  // NAVBAR HEIGHT
  useEffect(() => {

    const updateHeight = () => {

      if (navRef.current) {

        const height =
          navRef.current.offsetHeight;

        document.documentElement
          .style.setProperty(

            "--navbar-height",

            `${height}px`

          );

      }

    };

    updateHeight();

    window.addEventListener(
      "resize",
      updateHeight
    );

    return () =>
      window.removeEventListener(
        "resize",
        updateHeight
      );

  }, []);

  // CENTER MENU
  useEffect(() => {

    const el = menuScrollRef.current;

    const centerMenu = () => {

      if (!el) return;

      const scrollWidth =
        el.scrollWidth;

      const clientWidth =
        el.clientWidth;

      if (scrollWidth > clientWidth) {

        el.scrollLeft =
          (scrollWidth - clientWidth) / 2;

      } else {

        el.scrollLeft = 0;

      }

    };

    centerMenu();

    window.addEventListener(
      "resize",
      centerMenu
    );

    return () =>
      window.removeEventListener(
        "resize",
        centerMenu
      );

  }, []);

  // CLOSE SEARCH OVERLAY
  useEffect(() => {

    const handleClickOutside = (e) => {

      if (!showSearch) return;

      const clickedInsideSearch =

        searchRef.current?.contains(
          e.target
        );

      const clickedSearchButton =
        e.target.closest(".search-btn");

      if (
        !clickedInsideSearch &&
        !clickedSearchButton
      ) {

        setShowSearch(false);

      }

    };

    document.addEventListener(
      "click",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "click",
        handleClickOutside
      );

    };

  }, [showSearch]);

  // FETCH CART COUNT
  useEffect(() => {
    const fetchCartCount =
      async () => {
        try {
          const token =
            localStorage.getItem("token");

          // BELUM LOGIN
          if (!token) {
            setCartCount(0);
            return;
          }

          const response =
            await fetch(
              `${import.meta.env.VITE_API_URL}/api/products/my-bids`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          // TOKEN INVALID / UNAUTHORIZED
          if (!response.ok) {
            setCartCount(0);
            return;
          }

          const data =
            await response.json();

          // PASTIKAN ARRAY
          if (!Array.isArray(data)) {
            setCartCount(0);
            return;
          }

          const activeBids =
            data.filter(
              (item) =>
                item.product?.status ===
                "active"
            );

          setCartCount(
            activeBids.length
          );

        } catch (error) {
          console.log(error);
          setCartCount(0);
        }
      };
    fetchCartCount();
  }, [isLoggedIn]);

  const markNotificationsAsRead =
  async () => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) return;

      await fetch(

        `${import.meta.env.VITE_API_URL}/api/products/notifications/read-all`,

        {

          method: "PUT",

          headers: {

            Authorization:
              `Bearer ${token}`,

          },

        }

      );

      setNotifications(
        (prev) =>
          prev.map(
            (notif) => ({
              ...notif,
              isRead: true,
            })
          )
      );

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <nav
      ref={navRef}
      className={`navbar ${
        show ? "show" : "hide"
      }`}
    >

      <div className="container">

        {/* TOP NAV */}
        <div className="navbar-top">

          {/* LEFT */}
          <div className="nav-left">

            <button

              className="profile-btn"

              onClick={() => {

                if (isLoggedIn) {

                  navigate("/profile");

                } else {

                  onOpenAuth();

                }

              }}
            >

              <User
                size={24}
                strokeWidth={2}
              />

            </button>

          </div>

          {/* CENTER */}
          <div className="nav-center">

            <button

              className="logo-btn"

              onClick={() =>
                navigate("/")
              }
            >

              <img
                src={logoIcon}
                alt="bidrobe"
              />

            </button>

          </div>

          {/* RIGHT */}
          <div className="nav-right">

            {/* SEARCH */}
            <button

              className="icon-btn search-btn"

              onClick={() =>
                setShowSearch(true)
              }
            >
              <Search size={24} strokeWidth={2} />
            </button>

            {/* NOTIFICATIONS */}
            <div className="notif-wrapper">

              <button

                className="icon-btn"

                onClick={async () => {
                  const nextState =
                    !showNotifications;

                  setShowNotifications(
                    nextState
                  );

                  if (nextState) {
                    await markNotificationsAsRead();
                  }
                }}
              >

                <Bell
                  size={24}
                  strokeWidth={2}
                />

              </button>

              {unreadCount > 0 && (

                <span className="notif-badge">

                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}

                </span>

              )}

              {/* DROPDOWN */}
              {showNotifications && (

                <div className="notif-dropdown">

                  {notifications.length === 0 ? (

                    <p className="empty-notif">
                      Tidak ada notifikasi
                    </p>

                  ) : (

                    notifications.map((notif) => (

                      <div

                        key={notif._id}

                        className="notif-item"

                        onClick={() => {
                          navigate("/cart");
                          setShowNotifications(false);
                        }}
                      >

                        <p>
                          {notif.message}
                        </p>

                      </div>

                    ))

                  )}

                </div>

              )}

            </div>

            {/* CART */}
            <div className="cart-wrapper">

              <button

                className="icon-btn"

                onClick={() =>
                  handleProtectedRoute("/cart")
                }
              >

                <ClipboardList
                  size={24}
                  strokeWidth={2}
                />

              </button>

              {cartCount > 0 && (

                <span className="cart-badge">

                  {cartCount > 9
                    ? "9+"
                    : cartCount}

                </span>

              )}

            </div>

          </div>

        </div>

        {/* SEARCH OVERLAY */}
        {showSearch && (

          <div
            className="search-overlay"
            ref={searchRef}
          >

            <input

              type="text"

              placeholder="Cari Produk, Merek, Kategori, dan lainnya ..."

              value={searchInput}

              onChange={(e) =>
                setSearchInput(
                  e.target.value
                )
              }

              onKeyDown={(e) => {

                if (e.key === "Enter") {

                  handleSearch();

                }

              }}

            />

            <button

              className="search-close"

              onClick={() =>
                setShowSearch(false)
              }
            >

              ✕

            </button>

          </div>

        )}

        {/* BOTTOM NAV */}
        <div className="navbar-bottom">

          <div
            className="menu-scroll"
            ref={menuScrollRef}
          >

            <ul className="menu">

              <li>
                <button className="menu-btn" onClick={() => handleProtectedRoute("/my-products") }>
                  Produk
                </button>
              </li>

              <li>
                <button className="menu-btn" onClick={() => navigate("/products/Men")}>
                  Pria
                </button>
              </li>

              <li>
                <button className="menu-btn" onClick={() => navigate("/products/Women") }>
                  Wanita
                </button>
              </li>

              <li>
                <button className="menu-btn" onClick={() => navigate("/products/Children") }>
                  Anak
                </button>
              </li>

              <li>
                <button className="menu-btn" onClick={() => navigate("/products/Unisex") }>
                  Unisex
                </button>
              </li>

              <li>
                <button className="menu-btn" onClick={() => navigate("/About")}>
                  Tentang
                </button>
              </li>

            </ul>

          </div>

        </div>

      </div>

    </nav>

  );

};

export default Navbar;