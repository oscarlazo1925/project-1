// Register.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, InputGroup, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import { Eye, EyeSlash } from "react-bootstrap-icons"; // install react-bootstrap-icons

export default function Register() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [lastname, setLastname] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ email, password, firstname, middlename, lastname });
      setLoading(false);
      navigate("/profile");
    } catch (err) {
      // alert("Registration failed: " + err.message);
      setLoading(false);
      toast.error("Registration failed: " + err.message, {
        duration: 6000,
      });
    }
  };

  return (
    <Container className="mt-5 px-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-5">Register</h2>
      <Form onSubmit={handleRegister}>
        <Form.Group controlId="firstname" className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            value={firstname}
            required
            onChange={(e) => setFirstname(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="middlename" className="mb-3">
          <Form.Label>Middle Name</Form.Label>
          <Form.Control
            type="text"
            value={middlename}
            onChange={(e) => setMiddlename(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="lastname" className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            value={lastname}
            required
            onChange={(e) => setLastname(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="email" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Password</Form.Label>
          <InputGroup>
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
            className="w-50 content-center"
            disabled={loading}
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
              "Register"
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
}
