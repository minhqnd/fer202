import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { getUsers, createUser } from "../config/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    address: "",
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

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!/^\d{10,11}$/.test(form.phone)) {
      setError("Số điện thoại phải có 10 hoặc 11 chữ số.");
      return;
    }

    setLoading(true);

    try {
      const response = await getUsers();
      const users = response.data;

      const usernameExists = users.some(
        (user) =>
          user.username.toLowerCase() === form.username.trim().toLowerCase(),
      );

      const emailExists = users.some(
        (user) => user.email.toLowerCase() === form.email.trim().toLowerCase(),
      );

      if (usernameExists) {
        setError("Tên đăng nhập đã tồn tại.");
        return;
      }

      if (emailExists) {
        setError("Email đã được sử dụng.");
        return;
      }

      const newUser = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        role: "customer",
        avatar: "",
        address: form.address.trim(),
      };

      await createUser(newUser);

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      setError("Đăng ký thất bại. Hãy kiểm tra JSON Server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: "550px" }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Đăng ký tài khoản</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                required
              />
            </Form.Group>

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
                placeholder="example@gmail.com"
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
                placeholder="Nhập số điện thoại"
                pattern="[0-9]{10,11}"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ giao hàng"
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
                placeholder="Ít nhất 6 ký tự"
                minLength={6}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Xác nhận mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </Form.Group>

            <Button
              type="submit"
              variant="warning"
              className="w-100"
              disabled={loading}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </Form>

          <p className="text-center mt-3 mb-0">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;
