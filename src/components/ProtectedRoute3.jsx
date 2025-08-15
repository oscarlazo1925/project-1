import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, require2FA = false }) {
  const [status, setStatus] = useState({ loading: true, allow: false, twoFA: false });
  console.log('Protected Routes')
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("firebaseToken");

      if (!token) {
        setStatus({ loading: false, allow: false, twoFA: false });
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.message === "Had data") {
          const user = data.user;

          if (user.twoFactorEnabled && require2FA) {
            setStatus({ loading: false, allow: false, twoFA: true });
          } else {
            setStatus({ loading: false, allow: true, twoFA: false });
          }
        } else {
          setStatus({ loading: false, allow: false, twoFA: false });
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setStatus({ loading: false, allow: false, twoFA: false });
      }
    };

    checkAuth();
  }, [require2FA]);

  if (status.loading) return <div>Loading...</div>;
  if (status.twoFA) return <Navigate to="/verify-2fa" replace />;
  if (!status.allow) return <Navigate to="/login" replace />;

  return children;
}
