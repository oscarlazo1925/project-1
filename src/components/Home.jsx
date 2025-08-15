import { Container } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { require2FA } = useAuth();
  console.log("Home Page require2FA: ",require2FA)

  return (
    <Container className="mt-5 text-center">
      <h1>Welcome to the App</h1>
      <p>This is a sample home page. Login or Register to access your profile.</p>
    </Container>
  );
}
