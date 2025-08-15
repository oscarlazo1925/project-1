import { useEffect, useState } from "react";
import { Container, Button, Form, Image, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function TwoFactorSetup() {
  const [qrCodeURL, setQrCodeURL] = useState("");
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQR = async () => {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/2fa/setup`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
        },
      });
      const data = await res.json();
      setQrCodeURL(data.qrCodeDataURL);
    };
    fetchQR();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setloading(true);
    const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/2fa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`,
      },
      body: JSON.stringify({ token }),
    });

    const result = await res.json();
    if (res.ok) {
      setVerified(true);
      // alert("2FA enabled successfully.");
      toast.success("2FA enabled successfully.");
      setloading(false);
      navigate("/");
    } else {
      // alert("Verification failed: " + result.message);
      toast.error("Verification failed: " + result.message, {
        duration: 6000,
      });
      setloading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "500px" }}>
      <h3>Two-Factor Authentication Setup</h3>
      {qrCodeURL && (
        <div className="text-center mb-3">
          <Image src={qrCodeURL} alt="Scan QR code" fluid />
          <p className="text-muted">
            Scan this with Google Authenticator or Microsoft Authenticator
          </p>
        </div>
      )}
      <Form onSubmit={handleVerify}>
        <Form.Group controlId="code" className="mb-3">
          <Form.Label>Enter Code from App</Form.Label>
          <Form.Control
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </Form.Group>
        <Button
          type="submit"
          disabled={loading}
          variant="success"
          className="w-100"
        >
          {loading ? (
            <>
              <Spinner
                animation="border"
                size="sm"
                role="status"
                className="me-2"
              />
              Verifying...
            </>
          ) : (
            "Verify & Enable 2FA"
          )}
        </Button>
      </Form>
      {verified && (
        <p className="mt-3 text-success">
          ✅ 2FA has been enabled on your account.
        </p>
      )}
    </Container>
  );
}
