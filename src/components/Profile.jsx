import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../utils/authFetch";
import {
  Button,
  Container,
  Form,
  Image,
  Row,
  Col,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    photo: "",
  });
  const [loading, setloading] = useState(false);
  const [twofaLoading, setTwofaLoading] = useState(false);
  console.log(firebaseUser);

  useEffect(() => {
    const loadProfile = async () => {
      // console.log("loadProfile:", token);
      try {
        const data = await authFetch(`${import.meta.env.VITE_APP_API_URL}/users/profile`);
        console.log("profile.jsx ", data.user);
        setProfile(data.user);
        setForm({
          firstname: data.user.firstname || "",
          middlename: data.user.middlename || "",
          lastname: data.user.lastname || "",
          photo: data.user.photo || "",
          twoFactorEnabled: data.user.twoFactorEnabled,
        });
      } catch (err) {
        console.error("Failed to load profile", err.message);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    setloading(true);
    e.preventDefault();
    try {
      const updated = await authFetch(
        `${import.meta.env.VITE_APP_API_URL}/users/profile`,
        "PUT",
        form
      );
      toast.success("Profile updated!");
      // alert("Profile updated!");
      setProfile(updated);
      setloading(false);
    } catch (err) {
      // alert("Update failed: " + err.message);
      setloading(false);
      toast.error("Update failed: " + err.message, {
        duration: 6000,
      });
    }
  };
  console.log(form);
  return (
    <Container className="mt-5">
      <Row>
        <Col md={6} className="text-center">
          {form.photo && (
            <Image
              src={form.photo}
              roundedCircle
              width={150}
              className="mb-3"
            />
          )}
          <p>{firebaseUser?.email}</p>
          {/* <Button variant="danger" onClick={logout}>
            Logout
          </Button> */}

          <div>
            {profile?.twoFactorEnabled ? (
              <p>
                <strong>2FA:</strong> Enabled
              </p>
            ) : (
              <p>
                <strong>2FA:</strong> Not Enabled
              </p>
            )}
          </div>

          <div>
            {profile?.twoFactorEnabled && (
              <Badge
                disabled={twofaLoading}
                bg="danger"
                className="mt-2 p-2"
                style={{ cursor: "pointer" }}
                onClick={async () => {
                  setTwofaLoading(true)
                  await fetch(`${import.meta.env.VITE_APP_API_URL}/2fa/disable`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "firebaseToken"
                      )}`,
                    },
                  });
                  setTwofaLoading(false)
                  toast.success("2FA Dissabled!");
                  window.location.reload();
                }}
              >
                {twofaLoading ? (
                  <>
                    <Spinner
                      animation="border"
                      // size="sm"
                      style={{ width: '.8rem', height: '.8rem' }}
                      role="status"
                      className="me-2"
                    />
                    Updating...
                  </>
                ) : (
                  "Disable 2FA"
                )}
              </Badge>
            )}
          </div>

          <div>
            {!profile?.twoFactorEnabled && (
              <Badge
                disabled={twofaLoading}
                bg="primary"
                className="mt-2 p-2"
                style={{ cursor: "pointer" }}
                onClick={() => {setTwofaLoading(true); navigate("/2fa-setup")}}
              >
                {twofaLoading ? (
                  <>
                    <Spinner
                      animation="border"
                      // size="sm"
                      style={{ width: '.8rem', height: '.8rem' }}
                      role="status"
                      className="me-2"
                    />
                    Working...
                  </>
                ) : (
                  "Enable 2FA"
                )}
              </Badge>
            )}
          </div>
        </Col>
        <Col md={6} className="px-5">
          <h3 className="mb-5">Edit Profile</h3>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-2">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                className="shadow-sm"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Middle Name</Form.Label>
              <Form.Control
                name="middlename"
                value={form.middlename}
                onChange={handleChange}
                className="shadow-sm"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                className="shadow-sm"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Photo URL</Form.Label>
              <Form.Control
                name="photo"
                value={form.photo}
                onChange={handleChange}
                className="shadow-sm"
              />
            </Form.Group>
            <Button type="submit" disabled={loading} variant="primary" className="my-3">
              {loading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    role="status"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
