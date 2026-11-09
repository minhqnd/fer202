import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
  });

  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Vui lòng đăng nhập để xem thông tin tài khoản.</Alert>
      </Container>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });

    const success = await updateProfile(formData);
    setLoading(false);

    if (success) {
      setMsg({ text: 'Cập nhật thông tin thành công.', type: 'success' });
    } else {
      setMsg({ text: 'Lưu thông tin thất bại, vui lòng thử lại.', type: 'danger' });
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 750 }}>
      <Card className="border p-4 bg-white">
        <Row className="gy-4">
          <Col md={4} className="text-center border-end">
            <h5 className="fw-bold mb-1 mt-2">{currentUser.fullName}</h5>
            <p className="text-muted small mb-2">@{currentUser.username}</p>
            <Badge bg={currentUser.role === 'admin' ? 'danger' : 'secondary'} className="px-2 py-1">
              {currentUser.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
            </Badge>
          </Col>

          <Col md={8}>
            <h5 className="fw-bold mb-3 border-bottom pb-2">Thông Tin Cá Nhân</h5>

            {msg.text && <Alert variant={msg.type} className="py-2 small">{msg.text}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Email tài khoản</Form.Label>
                <Form.Control type="email" value={currentUser.email} disabled className="bg-light" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Họ và tên</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Số điện thoại</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold">Địa chỉ giao hàng mặc định</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="danger" size="sm" className="px-4" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default Profile;
