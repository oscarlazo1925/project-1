import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onIdTokenChanged,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

import { authFetch } from "../utils/authFetch";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(null);
  const [require2FA, setRequire2FA] = useState(null);

  const [twoFADone, setTwoFADone] = useState(null); // check if 2FA code already done

  const [loading, setLoading] = useState(true);

  // Auto-refresh Firebase ID token and keep localStorage in sync
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        localStorage.setItem("firebaseToken", idToken);
        setToken(idToken);
      } else {
        localStorage.removeItem("firebaseToken");
        setToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Check token on initial load
  // const [storedToken, setStoredToken] = useState(localStorage.getItem("firebaseToken"));
  //
  useEffect(() => {
    /**
     * upon login this will fire kasi may token na from
     * const [storedToken, setStoredToken] = useState(localStorage.getItem("firebaseToken"));
     * saan galing ang token? from --> loginWithGoogle
     */

    const checkToken = async () => {
      console.log(import.meta.env.VITE_APP_API_URL)
      const storedToken = localStorage.getItem("firebaseToken");
      if (storedToken) {
        try {
          const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          const resUser = await res.json();
          console.log(resUser);
          if (resUser.message === "Had data") {
            const user = resUser.user;
            console.log(
              "resUser.user.usertwoFactorEnabled",
              user.twoFactorEnabled
            );
            if (user.twoFactorEnabled === true) {
              console.log(user.twoFactorEnabled);
              setRequire2FA(true);
              setFirebaseUser(user);
              setToken(storedToken);
            } else {
              console.log(user.twoFactorEnabled);
              setRequire2FA(false);
              setFirebaseUser(user);
              setToken(storedToken);
            }
          } else {
            logout(); // Invalid token
          }
        } catch (err) {
          console.error("Auth check failed", err);
          logout();
        }
      }

      setLoading(false);
    };

    checkToken();
  }, []);

  const register = async ({
    email,
    password,
    firstname,
    middlename,
    lastname,
  }) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    // Save Firebase token locally
    localStorage.setItem("firebaseToken", idToken);

    // Sync with backend
    const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        email,
        firstname,
        middlename,
        lastname,
        firebaseUid: user.uid,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to register user in backend");
    }

    await sendEmailVerification(userCredential.user);
    console.log("Verification email sent!", userCredential.user);

    const backendUser = await res.json();

    setFirebaseUser(backendUser);
    setToken(idToken);
  };

  const login = async (email, password) => {
    try {
      // Sign in with Firebase
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log(result);
      const idToken = await result.user.getIdToken();
      console.log(idToken);
      localStorage.setItem("firebaseToken", idToken);

      const res = await authFetch(`${import.meta.env.VITE_APP_API_URL}/users/profile`);
      const mongoDBUser = res;
      console.log(mongoDBUser.user.twoFactorEnabled)
      const user = mongoDBUser.user
      if (mongoDBUser.message == "Had data") {
        if (user.twoFactorEnabled === true) {
          // 2FA is required; temporarily clear session
          setRequire2FA(true);
          setFirebaseUser(null);
          setToken(idToken); // You'll use this for verify-2fa
          // throw new Error("2FA_REQUIRED");
          // window.location.href = "/verify-2fa";
          navigate('/verify-2fa')
        } else {
          // 2FA not required; fully log user in
          setRequire2FA(false);
          setFirebaseUser(user);
          setToken(idToken);
        }
      } else {
        return "No data";
      }

      return user.twoFactorEnabled;
    } catch (error) {
      console.error("Login failed:", error.message || error);
      throw error; // Let caller handle it (e.g., show error or redirect)
    }
  };

  const loginWithGoogle = async () => {
    console.log("Using google auth");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      localStorage.setItem("firebaseToken", idToken);
      setToken(idToken);

      // 1. Check if user already exists in MongoDB
      const profileRes = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/users/profile`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      let mongoDBUser = null;

      console.log("profileRes.message", profileRes.ok);
      mongoDBUser = await profileRes.json();
      // return profileRes;
      if (mongoDBUser.message !== "No data") {
        // ✅ User already exists in backend
        // 2. Handle 2FA requirement
        if (mongoDBUser.user.twoFactorEnabled) {
          setRequire2FA(true);
          setFirebaseUser(null);
          setTwoFADone(false);
          // Redirect to 2FA verification page
         navigate('/verify-2fa')
        } else {
          setRequire2FA(false);
          setFirebaseUser(mongoDBUser.user);
        }
        console.log(mongoDBUser);
      } else {
        // ❌ User not found — create a new one
        const createRes = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/users/google-sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              email: user.email,
              firstname: user.displayName?.split(" ")[0] || "",
              middlename: user.displayName?.split(" ")[0] || "",
              lastname: user.displayName?.split(" ")[1] || "",
              firebaseUid: user.uid,
              isGoogleUser: true,
              photo: user.photoURL || "",
            }),
          }
        );

        if (!createRes.ok) {
          throw new Error("Failed to create Google user");
        }
        mongoDBUser = await createRes.json();
      }
    } catch (err) {
      alert("Google login failed: " + err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("firebaseToken");
    localStorage.removeItem("twoFADone");
    setFirebaseUser(null);
    setToken(null);
    setRequire2FA(false);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        token,
        login,
        register,
        loginWithGoogle,
        logout,
        require2FA,
        setRequire2FA,
        twoFADone,
        setTwoFADone, // optional if you want to reset manually
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
