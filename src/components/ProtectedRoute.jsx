import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { token, require2FA } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const twoFADone = localStorage.getItem("twoFADone");
  console.log(twoFADone)
  console.log("protectedRoutes:", require2FA);
  console.log("twoFADone:", typeof twoFADone);
  useEffect(() => {
    if (
      require2FA === true &&
      twoFADone !== "true" &&
      location.pathname !== "/verify-2fa"
    ) {
      navigate("/verify-2fa");
    }
  }, [require2FA, twoFADone, location.pathname, navigate]);



  if (!token) {
    return <Navigate to="/login" />;
  }

  // if (require2FA && location.pathname !== "/verify-2fa" && twoFADone === "false") {
  //        return <Navigate to="/verify-2fa" />;
  // }

  return children;
}

// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function ProtectedRoute({ children }) {
//   const { token } = useAuth();
//   return token ? children : <Navigate to="/login" />;
// }
