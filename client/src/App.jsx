import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/navbar";
import AuthModal from "./components/AuthModal";

import Home from "./pages/home";
import ProductDetail from "./pages/productDetail";
import Products from "./pages/products";
import Cart from "./pages/cart";
import About from "./pages/about";
import Profile from "./pages/profile";
import Search from "./pages/Search";

import "./App.css";

const SESSION_ACTIVITY_KEY = "lastActivityAt";
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
  localStorage.removeItem(SESSION_ACTIVITY_KEY);
};

const getInitialSession = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.removeItem(SESSION_ACTIVITY_KEY);

    return {
      hasSession: false,
      expired: false,
    };
  }

  const lastActivity = Number(
    localStorage.getItem(SESSION_ACTIVITY_KEY)
  );

  const sessionExpired =
    !Number.isFinite(lastActivity) ||
    lastActivity <= 0 ||
    Date.now() - lastActivity >= IDLE_TIMEOUT_MS;

  if (sessionExpired) {
    clearStoredSession();
  }

  return {
    hasSession: !sessionExpired,
    expired: sessionExpired,
  };
};

function App() {
  const [initialSession] = useState(getInitialSession);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [isSessionReady, setIsSessionReady] =
    useState(!initialSession.hasSession);

  const [authNotice, setAuthNotice] =
    useState(
      initialSession.expired
        ? `Sesi berakhir karena tidak ada aktivitas selama ${IDLE_TIMEOUT_MINUTES} menit. Silakan masuk kembali.`
        : ""
    );

  const setSessionLoginState =
    useCallback((loggedIn) => {
      if (loggedIn) {
        localStorage.setItem(
          SESSION_ACTIVITY_KEY,
          Date.now().toString()
        );
        setAuthNotice("");
      } else {
        clearStoredSession();
        setAuthNotice(
          "Anda telah keluar. Silakan masuk kembali untuk menggunakan Bidrobe."
        );
      }

      setIsLoggedIn(loggedIn);
      setIsSessionReady(true);
    }, []);

  const expireIdleSession =
    useCallback(() => {
      clearStoredSession();
      setIsLoggedIn(false);
      setIsSessionReady(true);
      setAuthNotice(
        `Sesi berakhir karena tidak ada aktivitas selama ${IDLE_TIMEOUT_MINUTES} menit. Silakan masuk kembali.`
      );
    }, []);

  // Validasi token tersimpan sebelum seluruh website dibuka.
  useEffect(() => {
    if (!initialSession.hasSession) return undefined;

    let ignoreResult = false;

    const validateStoredSession = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Sesi tidak valid");
        }

        const user = await response.json();

        if (ignoreResult) return;

        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
        setIsLoggedIn(true);
        setAuthNotice("");
      } catch (error) {
        if (ignoreResult) return;

        console.error(
          "Validasi sesi gagal:",
          error
        );
        clearStoredSession();
        setIsLoggedIn(false);
        setAuthNotice(
          "Sesi tidak valid atau telah berakhir. Silakan masuk kembali."
        );
      } finally {
        if (!ignoreResult) {
          setIsSessionReady(true);
        }
      }
    };

    validateStoredSession();

    return () => {
      ignoreResult = true;
    };
  }, [initialSession.hasSession]);

  // Logout otomatis setelah tidak ada aktivitas.
  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let sessionHasExpired = false;
    let lastPersistedActivity = Number(
      localStorage.getItem(SESSION_ACTIVITY_KEY)
    );

    const recordActivity = () => {
      if (sessionHasExpired) return;

      const now = Date.now();
      const storedActivity = Number(
        localStorage.getItem(SESSION_ACTIVITY_KEY)
      );

      if (
        !Number.isFinite(storedActivity) ||
        storedActivity <= 0 ||
        now - storedActivity >= IDLE_TIMEOUT_MS
      ) {
        sessionHasExpired = true;
        expireIdleSession();
        return;
      }

      if (
        !Number.isFinite(lastPersistedActivity) ||
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
        localStorage.getItem(SESSION_ACTIVITY_KEY)
      );

      if (
        !Number.isFinite(lastActivity) ||
        lastActivity <= 0 ||
        Date.now() - lastActivity >= IDLE_TIMEOUT_MS
      ) {
        sessionHasExpired = true;
        expireIdleSession();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
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

    const idleCheckInterval = window.setInterval(
      checkIdleSession,
      15000
    );

    checkIdleSession();

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(
          eventName,
          recordActivity
        );
      });

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.clearInterval(idleCheckInterval);
    };
  }, [isLoggedIn, expireIdleSession]);

  // Sinkronisasi logout antartab.
  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key === "token" &&
        !event.newValue
      ) {
        setIsLoggedIn(false);
        setIsSessionReady(true);
        setAuthNotice(
          "Sesi telah berakhir. Silakan masuk kembali."
        );
      }
    };

    window.addEventListener("storage", handleStorage);

    return () =>
      window.removeEventListener(
        "storage",
        handleStorage
      );
  }, []);

  return (
    <BrowserRouter>
      <div
        className={`app ${
          isLoggedIn ? "" : "auth-locked"
        }`}
      >
        {!isSessionReady ? (
          <div
            className="session-loading"
            role="status"
          >
            Memeriksa sesi...
          </div>
        ) : !isLoggedIn ? (
          <AuthModal
            required
            onClose={() => {}}
            setIsLoggedIn={setSessionLoginState}
            notice={authNotice}
          />
        ) : (
          <>
            <Navbar />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/profile"
                element={
                  <Profile
                    onLogout={() =>
                      setSessionLoginState(false)
                    }
                  />
                }
              />
              <Route path="/search" element={<Search />} />
              <Route
                path="/my-products"
                element={<Products />}
              />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/product/:id"
                element={<ProductDetail />}
              />
            </Routes>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
