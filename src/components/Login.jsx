import { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { getUsers } from "../config/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } catch {
        localStorage.removeItem("currentUser");
      }
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
    setError("");
    setLoading(true);

    try {
      const response = await getUsers();
      const identifier = form.identifier.trim().toLowerCase();

      const user = response.data.find(
        (item) =>
          (item.username?.toLowerCase() === identifier ||
            item.email?.toLowerCase() === identifier) &&
          item.password === form.password,
      );

      if (!user) {
        setError("Tên tài khoản/email hoặc mật khẩu không chính xác.");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      window.dispatchEvent(new Event("authChange"));

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
              <Form.Label>Tên tài khoản hoặc email</Form.Label>
              <Form.Control
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder="Nhập tên tài khoản hoặc email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
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
