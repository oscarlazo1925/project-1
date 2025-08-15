// Verify2FA.jsx
import { useRef, useState, useEffect } from "react";
import { Container, Form, Button, Badge } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Verify2FA() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const twoFADone = localStorage.getItem("twoFADone");

  const { token, require2FA, setRequire2FA } = useAuth();

  useEffect(() => {
    let timeout;
    if (require2FA === false) {
      timeout = setTimeout(() => {
        navigate("/"); // Redirect if 2FA not needed
      }, 2000); // ⏱ 5-second delay
    }
    return () => clearTimeout(timeout); // 🧹 Clean up on unmount
  }, [require2FA, navigate]);

  // ✅ Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!token || !code) {
      setMessage("Missing token or 2FA code.");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/2fa/verify-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.message || "2FA verification failed");
        return;
      }

      // ✅ 2FA success
      setLoading(false);
      setMessage("2FA verified successfully.");
      setRequire2FA(false);
      localStorage.setItem("twoFADone", true);

      // setTimeout(function () {
      //   navigate("/profile"); // Better than window.location.href
      // }, 2000);
    } catch (err) {
      console.error("2FA verification error:", err);
      setMessage("An error occurred during 2FA verification.");
    }
  };

  function InnerComponent() {
    return (
      <Container className="mt-5" style={{ maxWidth: "500px" }}>
        <Form.Group>
          <Form.Label>Verification Done.</Form.Label>
        </Form.Group>
        <Form.Group>
          <Badge bg="success" className="p-2" style={{cursor:"pointer"}} onClick={() => navigate("/")}>
            Go Back Home
          </Badge>
        </Form.Group>
      </Container>
    );
  }

  return (
    <>
      <Container className="mt-5" style={{ maxWidth: "500px" }}>
        <h3>Two-Factor Verification</h3>
        {twoFADone === "false" || twoFADone === null ? (
          <Form onSubmit={handleVerify}>
            <Form.Group>
              <Form.Label>Enter your 6-digit code</Form.Label>
              <Form.Control
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
                maxLength={6}
                ref={inputRef}
              />
            </Form.Group>
            <Button type="submit" className="mt-3" disabled={loading}>
              {loading ? "Verifying..." : "Verify 2FA Code"}
            </Button>
          </Form>
        ) : (
          <InnerComponent />
        )}
        {/* {message && <p className="text-danger mt-2">{message}</p>} */}
      </Container>
    </>
  );
}
