import React, {
  useEffect,
} from "react";

import {
  Navigate,
} from "react-router-dom";

const ProtectedRoute = ({
  children,
  isLoggedIn,
  onOpenAuth,
}) => {

  useEffect(() => {

    if (!isLoggedIn) {

      onOpenAuth();

    }

  }, [isLoggedIn]);

  // BLOCK PAGE
  if (!isLoggedIn) {

    return <Navigate to="/" />;

  }

  return children;

};

export default ProtectedRoute;