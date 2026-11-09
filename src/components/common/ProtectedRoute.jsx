import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container, Alert, Button } from 'react-bootstrap';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger" className="d-inline-block text-start p-4">
          <Alert.Heading>Truy cập bị từ chối</Alert.Heading>
          <p>
            Bạn cần đăng nhập với quyền <strong>Quản trị viên (Admin)</strong> để xem trang này.
          </p>
          <hr />
          <div className="d-flex gap-2">
            <Button as={Link} to="/login" variant="danger" size="sm">
              Đổi sang tài khoản Admin
            </Button>
            <Button as={Link} to="/" variant="secondary" size="sm">
              Về Trang chủ
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
