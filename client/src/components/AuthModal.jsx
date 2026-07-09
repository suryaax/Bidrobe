import React, {
  useState,
  useEffect,
} from "react";

import "./AuthModal.css";

import { useNavigate } from "react-router-dom";

const AuthModal = ({ onClose, setIsLoggedIn, }) => {

  // 🔥 LOGIN / REGISTER MODE
  const [isLogin, setIsLogin] =
    useState(true);
  
  const [showForgotPopup,
    setShowForgotPopup] =
    useState(false);

  const [username, setUsername] =
    useState("");

  // 🔥 FORM STATES
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [phoneNumber,
    setPhoneNumber] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const navigate = useNavigate();

  // 🔥 LOCK BODY SCROLL
  useEffect(() => {

    document.body.style.overflow =
      "hidden";

    return () => {

      document.body.style.overflow =
        "auto";

    };

  }, []);

  // 🔥 HANDLE LOGIN / REGISTER
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // =========================
      // REGISTER
      // =========================
      if (!isLogin) {

        // PASSWORD CHECK
        if (
          password !== confirmPassword
        ) {
          alert(
            "Kata Sandi tidak sesuai!"
          );
          return;
        }

        const phoneRegex =
          /^[1-9]\d{7,14}$/;
        if (
          !phoneRegex.test(phoneNumber)
        ) {
          alert(
            "Gunakan nomor WhatsApp internasional (8-15 digit, tanpa + dan tanpa angka 0 di depan)."
          );
          return;
        }

        const response =
          await fetch(

            `${import.meta.env.VITE_API_URL}/api/auth/register`,

            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

              },

              body: JSON.stringify({

                username,
                email,
                password,
                phoneNumber,

              }),

            }

          );

        // 🔥 SAFE RESPONSE
        const text =
          await response.text();

        console.log(text);

        const data =
          text ? JSON.parse(text) : {};

        // REGISTER FAILED
        if (!response.ok) {

          alert(
            data.message ||
            "Registrasi gagal"
          );

          return;

        }

        alert(
          data.message ||
          "Registrasi sukses"
        );

        // SWITCH TO LOGIN
        setIsLogin(true);

        // CLEAR FORM
        setUsername("");
        setEmail("");
        setPassword("");
        setPhoneNumber("");
        setConfirmPassword("");

        return;

      }

      // =========================
      // LOGIN
      // =========================
      const response =
        await fetch(

          `${import.meta.env.VITE_API_URL}/api/auth/login`,

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body: JSON.stringify({

              email,
              password,

            }),

          }

        );

      // 🔥 SAFE RESPONSE
      const text =
        await response.text();

      console.log(text);

      const data =
        text ? JSON.parse(text) : {};

      // LOGIN FAILED
      if (!response.ok) {

        alert(
          data.message ||
          "Masuk gagal"
        );

        return;

      }

      // SAVE TOKEN
      localStorage.setItem(
        "token",
        data.token
      );

      // SAVE USER
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      alert(
        data.message ||
        "Berhasil masuk"
      );

      // UPDATE LOGIN STATE
      setIsLoggedIn(true);

      // CLOSE MODAL
      onClose();
      navigate("/profile");
      

    } catch (error) {

      console.log(error);

      alert(
        error.message
      );

    }

  };

  return (

    <div
      className="auth-overlay"
      onClick={onClose}
    >

      <div

        className="auth-card"

        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* CLOSE */}
        <button

          className="auth-close"

          onClick={onClose}
        >

          ✕

        </button>

        {/* TITLE */}
        <h2>

          {isLogin
            ? "Selamat Datang Kembali!"
            : "Selamat Datang!"}

        </h2>

        {/* SUBTITLE */}
        <p className="auth-subtitle">

          {isLogin

            ? "Harap masukkan email dan password dibawah!"

            : "Silakan masukkan nomor telepon, alamat email, kata sandi, dan konfirmasi kata sandi Anda di bawah ini untuk membuat akun!"

          }

        </p>

        {/* FORM */}
        <div className="auth-form-wrapper">

          <form

            className="auth-form"

            onSubmit={handleSubmit}
          >

            {/* PHONE NUMBER */}
            {!isLogin && (
              <input
                type="tel"
                maxLength={15}
                placeholder="6281234567890"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value;

                  // Hanya angka
                  if (!/^\d*$/.test(value)) return;

                  // Tidak boleh diawali 0
                  if (
                    value.length > 0 &&
                    value.startsWith("0")
                  ) {
                    return;
                  }

                  setPhoneNumber(value);
                }}
              />
            )}

            {/* USERNAME */}
            {!isLogin && (

              <input

                type="text"

                placeholder="Username"

                value={username}

                onChange={(e) =>
                  setUsername(e.target.value)
                }

              />

            )}

            <input

              type="email"

              placeholder="Email"

              value={email}

              onChange={(e) =>
                setEmail(e.target.value)
              }

            />

            {/* PASSWORD */}
            <input

              type="password"

              placeholder="Kata Sandi"

              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }

            />

            {/* CONFIRM PASSWORD */}
            {!isLogin && (

              <input

                type="password"

                placeholder="Konfirmasi Kata Sandi"

                value={confirmPassword}

                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }

              />

            )}

            {/* SUBMIT */}
            <button

              type="submit"

              className="auth-submit"
            >

              {isLogin
                ? "Masuk"
                : "Daftar"}

            </button>

            {/* SWITCH */}
            <div className="auth-switch-section">

              <p className="auth-switch-text">

                {isLogin

                  ? "Tidak memiliki akun?"

                  : "Sudah memiliki akun?"

                }

              </p>

              <button

                type="button"

                className="auth-switch-btn"

                onClick={() =>
                  setIsLogin(!isLogin)
                }
              >

                {isLogin
                  ? "Daftar"
                  : "Masuk"}

              </button>

            </div>

          </form>

        </div>

        {/* FORGOT PASSWORD */}
        {isLogin && (

          <button
            className="forgot-btn"
            onClick={() =>
              setShowForgotPopup(true)
            }
          >
            lupa kata sandi?
          </button>
        )}

      </div>
        
      {showForgotPopup && (
        <div className="forgot-popup">
          <div className="forgot-popup-card">
            <h3>
              Pemulihan Kata Sandi
            </h3>

            <p>
              Fitur Pemulihan kata sandi sedang 
              dalam tahap pengembangan.
              Harap hubungi  pengembang
              untuk bantuan lebih lanjut.
            </p>

            <button
              onClick={() =>
                setShowForgotPopup(false)
              }
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>

  );

};

export default AuthModal;