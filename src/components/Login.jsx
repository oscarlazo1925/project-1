import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { Eye, EyeSlash, Google } from "react-bootstrap-icons"; // install react-bootstrap-icons
import * as Icon from "react-bootstrap-icons";
import toast from "react-hot-toast";

export default function Login() {
  //<<signInWithEmailAndPassword
  const { login, loginWithGoogle, require2FA, twoFADone, token } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // 🚨 Redirect if already logged in
  useEffect(() => {
    if (token && require2FA && twoFADone === "false") {
      navigate("/verify-2fa"); //<< go to home after login
    } else if (token) {
      navigate("/");
    } else {
      // navigate("/");
      console.log(token, twoFADone);
    }
  }, [token, twoFADone, require2FA, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      // alert("Please enter both email and password.");
      toast.error("Please enter both email and password.", {
        duration: 6000,
      });
      return;
    }

    setLoading(true);

    try {
      const returnFromLogin = await login(email, password); // Your login function (signInWithEmailAndPassword + profile fetch)
      // ✅ Only navigate if 2FA is not required (handle inside login)

      console.log("After login:", require2FA);
      console.log("returnFromLogin:", returnFromLogin);
      if (returnFromLogin) {
        console.log("If require2FA is true:", require2FA);
        navigate("/verify-2fa");
      } else {
        console.log("If require2FA is false:", require2FA);
        navigate("/");
      }

      console.log("returnFromLogin:", returnFromLogin);
    } catch (err) {
      console.error("Login error:", err);

      const firebaseErrorMessages = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many login attempts. Try again later.",
        "auth/invalid-email": "Invalid email format.",
      };

      const message =
        firebaseErrorMessages[err.code] ||
        err.message ||
        "Login failed. Please try again.";

      // alert(message);
      toast.error(message, {
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("Login.jsx"); // ✅ This will now fire
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle(); //<< from AuthContext.jsx
      console.log("Login.jsx", user); // ✅ This will now fire
      // console.log("AccessToken", user._tokenResponse.photoURL);
      // console.log(require2FA)
      // if (require2FA) {
      //   navigate("/verify-2fa"); //<< go to home after login
      // } else {
      //   navigate("/"); //<< go to home after login
      // }
    } catch (err) {
      if (err.message === "2FA_REQUIRED") {
        console.log(err);
        navigate("/verify-2fa");
      } else {
        console.error("Login failed:", err);
        toast.error("Google login failed: " + err.message, {
          duration: 6000,
        });
        // alert("Google login failed: " + err.message);
      }
    }
  };

  return (
    <Container className="mt-5 px-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-5">Login</h2>
      <Form onSubmit={handleEmailLogin}>
        <Form.Group controlId="email" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            required
            className="shadow-sm"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Password</Form.Label>
          <InputGroup className="shadow-sm">
            <Form.Control
              type={showPassword ? "text" : "password"}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1} // so toggle doesn't get focused when tabbing
            >
              {showPassword ? <EyeSlash /> : <Eye />}
            </Button>
          </InputGroup>
        </Form.Group>
        <div className="text-center">
        <Button
          variant="info"
          type="submit"
          className="w-50 shadow mt-3"
          disabled={loading}
        >
          {/* {loading ? "Logging in..." : "Login"} */}
          {loading ? (
            <>
              <Spinner
                animation="border"
                size="sm"
                role="status"
                className="me-2"
              />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        </div>
      </Form>

      <hr style={{width:'80%'}} className="mx-auto"/>

      <div className="text-end">
        {/* <Button
          variant="secondary"
          disabled={googleLoading}
          onClick={handleGoogleLogin}
          className="w-25"
        > */}
          {googleLoading ? (
            <>
              <Spinner
                animation="border"
                size="sm"
                role="status"
                className="me-2"
              />
            </>
          ) : (
            <div style={{cursor:'pointer', 'font-size':'.7em'}} title="click G logo to login using google credentials.">
              <span className="text-muted fst-italic">or login with &nbsp;</span> <Google color="black"  onClick={handleGoogleLogin} /> <span>oogle</span>
            </div>
          )}
        {/* </Button> */}
      </div>
    </Container>
  );
}
