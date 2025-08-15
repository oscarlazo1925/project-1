import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavbarComponent() {
  const { token, logout, require2FA } = useAuth();
  const navigate = useNavigate();
  // console.log(token, require2FA);
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Navbar bg="secondary" variant="light" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          UBIS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            {token && (
              <>
              <Nav.Link as={Link} to="/courses">
                Ka-barangay
              </Nav.Link>
              <Nav.Link as={Link} to="/courses">
                Hosehold
              </Nav.Link>
              </>
            )}

            {token && (
              <Nav.Link as={Link} to="/profile">
                Profile
              </Nav.Link>
            )}
          </Nav>

          <Nav className="ms-auto">
            {token ? (
              <>
                {/* {require2FA && (
                  <Nav.Link as={Link} to="/verify-2fa" className="text-warning">
                    2FA Required
                  </Nav.Link>
                )} */}
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
