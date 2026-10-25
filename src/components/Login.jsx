import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { getUsers } from "../config/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await getUsers();

      const user = response.data.find(
        (item) =>
          item.username === form.username.trim() &&
          item.email.toLowerCase() === form.email.trim().toLowerCase(),
      );

      if (!user) {
        setError("Tên đăng nhập hoặc email không chính xác.");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: "450px" }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Đăng nhập</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
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
                placeholder="Nhập email"
                required
              />
            </Form.Group>

            <Button
              type="submit"
              variant="warning"
              className="w-100"
              disabled={loading}
            >
              {loading ? "Đang kiểm tra..." : "Đăng nhập"}
            </Button>
          </Form>

          <p className="text-center mt-3 mb-0">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
