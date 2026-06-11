import React, { useState } from "react";

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
import Category from "./pages/category";
import About from "./pages/about";
import Profile from "./pages/profile";
import Search from "./pages/Search";

import AuthModal from "./components/AuthModal";

import "./App.css";

function App() {

  const [showAuthModal,
    setShowAuthModal] =
    useState(false);

  const [isLoggedIn,
    setIsLoggedIn] =
    useState(
      !!localStorage.getItem("token")
    );

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

            onClose={() =>
              setShowAuthModal(false)
            }

            setIsLoggedIn={
              setIsLoggedIn
            }

          />

        )}

        {/* ROUTES */}
        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/products"
            element={<Category />}
          />

          <Route
            path="/products/:category"
            element={<Category />}
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
                <Profile />
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