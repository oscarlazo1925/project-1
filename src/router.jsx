import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import TwoFactorSetup from "./pages/TwoFactorSetup";
import TwoFactorVerify from "./pages/TwoFactorVerify";
import ProtectedRoute from "./components/ProtectedRoute";
import NavbarComponent from "./components/NavbarComponent";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavbarComponent />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/2fa-setup"
            element={
              <ProtectedRoute>
                <TwoFactorSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-2fa"
            element={
              <ProtectedRoute>
                <TwoFactorVerify />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  );
}
