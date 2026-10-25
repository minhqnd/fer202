import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { updateUser } from "../config/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const currentUser = JSON.parse(savedUser);

      setUser(currentUser);
      setForm({
        fullName: currentUser.fullName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });
    } catch (error) {
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!user) {
      setError("Vui lòng đăng nhập lại.");
      return;
    }

    if (!/^\d{10,11}$/.test(form.phone)) {
      setError("Số điện thoại phải có 10 hoặc 11 chữ số.");
      return;
    }

    setLoading(true);

    try {
      const updatedUser = {
        ...user,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      await updateUser(user.id, updatedUser);

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      setUser(updatedUser);
      setMessage("Cập nhật thông tin thành công.");
    } catch (error) {
      setError("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="py-5">
        <p>Đang tải thông tin...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Thông tin cá nhân</h2>

              {message && <Alert variant="success">{message}</Alert>}

              {error && <Alert variant="danger">{error}</Alert>}

              <div className="mb-3">
                <strong>Tên đăng nhập:</strong> {user.username}
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10,11}"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Địa chỉ giao hàng</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="warning"
                  className="w-100 mb-2"
                  disabled={loading}
                >
                  {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                </Button>
              </Form>

              <div className="d-flex justify-content-between mt-3">
                <Link to="/orders">Lịch sử đơn hàng</Link>

                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => navigate("/")}
                >
                  Về trang chủ
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
