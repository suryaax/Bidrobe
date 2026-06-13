import React, {
  useEffect,
  useState,
} from "react";

import "./profile.css";

const Profile = () => {

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // FETCH USER DATA
  useEffect(() => {

    const fetchProfile = async () => {

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

        const data =
          await response.json();

        setUsername(
          data.username || ""
        );

        setEmail(
          data.email || ""
        );

        setPhoneNumber(
          data.phoneNumber || ""
        );

      } catch (error) {

        console.log(error);

      }

    };

    fetchProfile();

  }, []);

  // UPDATE PROFILE
  const handleUpdate = async () => {

    try {
      // EMPTY VALIDATION
      if (
        !username.trim() ||
        !email.trim() ||
        !phoneNumber.trim()
      ) {
        alert(
          "Seluruh kolom harus diisi"
        );
        return;
      }

      // PHONE VALIDATION
      if (!/^\d+$/.test(phoneNumber)) {
        alert(
          "Nomor Handphone hanya boleh diisi oleh nomor"
        );
        return;
      }

      // EMAIL VALIDATION
      if (!email.includes("@")) {
        alert(
          "Harap masukkan email yang valid"
        );
        return;
      }

      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },

          body: JSON.stringify({
            username,
            email,
            phoneNumber,
            password,
          }),
        }
      );

      const data =
        await response.json();
      console.log(data);
      alert("Profile updated!");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

  };
  return (
    <div className="profile-page container">
      <div className="profile-card">

        {/* TITLE */}
        <h1 className="profile-title">
          Profile-mu
        </h1>

        <div className="profile-divider"></div>
        {/* FORM */}
        <div className="profile-form">

          {/* USERNAME */}
          <input
            type="text"
            placeholder="Ubah username"
            className="profile-input"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }

          />

          {/* PHONE */}
          <input
            type="tel"
            maxLength={15}
            placeholder="Ubah Nomor Handphone"
            className="profile-input"
            value={phoneNumber}
            onChange={(e) => {

              const value =
                e.target.value;

              // ONLY NUMBERS
              if (/^\d*$/.test(value)) {
                setPhoneNumber(value);
              }

              else {
                alert(
                  "Nomor handphone hanya boleh berisi nomor"
                );
              }
            }}
          />

          {/* EMAIL */}
          <input

            type="email"

            placeholder="Ubah Email"

            className="profile-input"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }

          />

          {/* PASSWORD */}
          <input

            type="password"

            placeholder="Ubah Password"

            className="profile-input"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

          />

          {/* BUTTON */}
          <button

            className="profile-btn"

            onClick={handleUpdate}

          >

            {loading
              ? "Memperbarui..."
              : "Konfirmasi"}

          </button>

        </div>

      </div>

      <div className="logout-wrapper">

        <button

          className="logout-btn"

          onClick={() => {

            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "user"
            );

            window.location.href = "/";

          }}

        >

          Keluar

        </button>

      </div>

    </div>

  );

};

export default Profile;