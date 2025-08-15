import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container className="text-center mt-5">
      <h1 className="display-4">404</h1>
      <p className="lead">Page Not Found</p>
      <Button variant="primary" onClick={() => navigate("/")}>
        Go Back Home
      </Button>
    </Container>
  );
}
