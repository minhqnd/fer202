import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { availableUsers, loginUser, currentUser } = useAuth();

  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập hoặc email');
      return;
    }

    const found = availableUsers.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() ||
        u.email.toLowerCase() === username.trim().toLowerCase()
    );

    if (found) {
      loginUser(found);
      navigate(found.role === 'admin' ? '/admin' : from, { replace: true });
    } else {
      setError('Tài khoản không tồn tại trên hệ thống. Bạn có thể chọn nhanh từ danh sách bên dưới.');
    }
  };

  const handleSelectDemoUser = (user) => {
    loginUser(user);
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 650 }}>
      <Card className="border p-4 bg-white">
        <div className="text-center mb-4">
          <h3 className="fw-bold">Đăng Nhập Tài Khoản</h3>
          <p className="text-secondary small">
            Chọn tài khoản thử nghiệm để kiểm tra các phân quyền của hệ thống.
          </p>
        </div>

        {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

        <Form onSubmit={handleCustomLogin} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Tên đăng nhập hoặc Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="admin, nguyenvana, hoặc vana@gmail.com..."
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
            />
          </Form.Group>

          <Button type="submit" variant="danger" className="w-100 fw-semibold">
            Đăng nhập
          </Button>
        </Form>

        <div className="position-relative text-center my-3">
          <hr />
          <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small" style={{ fontSize: '0.75rem' }}>
            HOẶC CHỌN NHANH TÀI KHOẢN
          </span>
        </div>

        <Row className="g-2">
          {availableUsers.map((user) => (
            <Col md={12} key={user.id}>
              <div
                className={`p-2 border rounded d-flex align-items-center justify-content-between ${
                  currentUser?.id === user.id ? 'border-danger bg-light' : 'bg-white'
                }`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSelectDemoUser(user)}
              >
                <div>
                  <div className="fw-semibold small">{user.fullName}</div>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {user.email} • {user.phone}
                  </small>
                </div>

                <div>
                  <Badge bg={user.role === 'admin' ? 'danger' : 'secondary'} className="me-2">
                    {user.role === 'admin' ? 'Admin' : 'Khách hàng'}
                  </Badge>
                  <Button variant="outline-dark" size="sm">
                    Chọn
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </Container>
  );
};

export default Login;
