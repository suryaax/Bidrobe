import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import ProtectedRoute
from "./components/ProtectedRoute";

import Navbar from "./components/navbar";

import Home from "./pages/home";
import ProductDetail from "./pages/productDetail";
import Products from "./pages/products";
import Cart from "./pages/cart";
import About from "./pages/about";
import Profile from "./pages/profile";
import Search from "./pages/Search";

import AuthModal from "./components/AuthModal";

import "./App.css";

const SESSION_ACTIVITY_KEY =
  "lastActivityAt";

const DEFAULT_IDLE_TIMEOUT_MINUTES = 30;

const configuredIdleTimeout = Number(
  import.meta.env.VITE_IDLE_TIMEOUT_MINUTES
);

const IDLE_TIMEOUT_MINUTES =
  Number.isFinite(configuredIdleTimeout) &&
  configuredIdleTimeout > 0
    ? configuredIdleTimeout
    : DEFAULT_IDLE_TIMEOUT_MINUTES;

const IDLE_TIMEOUT_MS =
  IDLE_TIMEOUT_MINUTES * 60 * 1000;

const clearStoredSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem(
    SESSION_ACTIVITY_KEY
  );
};

const getInitialSession = () => {
  const token =
    localStorage.getItem("token");

  if (!token) {
    localStorage.removeItem(
      SESSION_ACTIVITY_KEY
    );

    return {
      isLoggedIn: false,
      expired: false,
    };
  }

  const lastActivity = Number(
    localStorage.getItem(
      SESSION_ACTIVITY_KEY
    )
  );

  const sessionExpired =
    !Number.isFinite(lastActivity) ||
    lastActivity <= 0 ||
    Date.now() - lastActivity >=
      IDLE_TIMEOUT_MS;

  if (sessionExpired) {
    clearStoredSession();
  }

  return {
    isLoggedIn: !sessionExpired,
    expired: sessionExpired,
  };
};

function App() {

  const [initialSession] =
    useState(getInitialSession);

  const [showAuthModal,
    setShowAuthModal] =
    useState(initialSession.expired);

  const [authNotice,
    setAuthNotice] =
    useState(
      initialSession.expired
        ? `Sesi berakhir karena tidak ada aktivitas selama ${IDLE_TIMEOUT_MINUTES} menit. Silakan masuk kembali.`
        : ""
    );

  const [isLoggedIn,
    setIsLoggedIn] =
    useState(initialSession.isLoggedIn);

  const setSessionLoginState =
    useCallback((loggedIn) => {
      if (loggedIn) {
        localStorage.setItem(
          SESSION_ACTIVITY_KEY,
          Date.now().toString()
        );
      } else {
        clearStoredSession();
      }

      setIsLoggedIn(loggedIn);
    }, []);

  const expireIdleSession =
    useCallback(() => {
      clearStoredSession();
      setIsLoggedIn(false);
      setAuthNotice(
        `Sesi berakhir karena tidak ada aktivitas selama ${IDLE_TIMEOUT_MINUTES} menit. Silakan masuk kembali.`
      );
      setShowAuthModal(true);
    }, []);

  // LOGOUT OTOMATIS SETELAH TIDAK ADA AKTIVITAS
  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let sessionHasExpired = false;
    let lastPersistedActivity = Number(
      localStorage.getItem(
        SESSION_ACTIVITY_KEY
      )
    );

    const recordActivity = () => {
      if (sessionHasExpired) return;

      const now = Date.now();

      // Batasi penulisan localStorage agar event mousemove
      // tidak menulis terlalu sering.
      if (
        !Number.isFinite(
          lastPersistedActivity
        ) ||
        now - lastPersistedActivity >= 5000
      ) {
        lastPersistedActivity = now;
        localStorage.setItem(
          SESSION_ACTIVITY_KEY,
          now.toString()
        );
      }
    };

    const checkIdleSession = () => {
      if (sessionHasExpired) return;

      const lastActivity = Number(
        localStorage.getItem(
          SESSION_ACTIVITY_KEY
        )
      );

      if (
        !Number.isFinite(lastActivity) ||
        lastActivity <= 0 ||
        Date.now() - lastActivity >=
          IDLE_TIMEOUT_MS
      ) {
        sessionHasExpired = true;
        expireIdleSession();
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        checkIdleSession();
      }
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(
        eventName,
        recordActivity,
        { passive: true }
      );
    });

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    const idleCheckInterval =
      window.setInterval(
        checkIdleSession,
        15000
      );

    checkIdleSession();

    return () => {
      activityEvents.forEach(
        (eventName) => {
          window.removeEventListener(
            eventName,
            recordActivity
          );
        }
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.clearInterval(
        idleCheckInterval
      );
    };
  }, [isLoggedIn, expireIdleSession]);

  // SINKRONISASI LOGOUT ANTARTAB
  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key === "token" &&
        !event.newValue
      ) {
        setIsLoggedIn(false);
        setAuthNotice(
          "Sesi telah berakhir. Silakan masuk kembali."
        );
        setShowAuthModal(true);
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () =>
      window.removeEventListener(
        "storage",
        handleStorage
      );
  }, []);

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthNotice("");
  };

  return (

    <BrowserRouter>

      <div className="app">

        {/* NAVBAR */}
        <Navbar

          isLoggedIn={isLoggedIn}

          onOpenAuth={() =>
            setShowAuthModal(true)
          }

        />

        {/* AUTH MODAL */}
        {showAuthModal && (

          <AuthModal

            onClose={closeAuthModal}

            setIsLoggedIn={
              setSessionLoginState
            }

            notice={authNotice}

          />

        )}

        {/* ROUTES */}
        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                onOpenAuth={() =>
                  setShowAuthModal(true)
                }
              >
                <Profile
                  onLogout={() =>
                    setSessionLoginState(
                      false
                    )
                  }
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={<Search />}
          />

          <Route
            path="/my-products"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                onOpenAuth={() =>
                  setShowAuthModal(true)
                }
              >
                <Products />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                onOpenAuth={() =>
                  setShowAuthModal(true)
                }
              >
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/product/:id"
            element={

              <ProductDetail

                isLoggedIn={isLoggedIn}

                onOpenAuth={() =>
                  setShowAuthModal(true)
                }

              />

            }
          />

        </Routes>

      </div>

    </BrowserRouter>

  );

}

export default App;
