import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api, { endpoints } from '../../config/api';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalFoods: 0,
    totalUsers: 0,
    statusCounts: {},
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [ordersRes, foodsRes, usersRes] = await Promise.all([
          api.get(`${endpoints.orders}?_sort=createdAt&_order=desc`),
          api.get(endpoints.foods),
          api.get(endpoints.users),
        ]);

        const orders = ordersRes.data;
        const foods = foodsRes.data;
        const users = usersRes.data;

        const revenue = orders
          .filter((ord) => ord.status !== 'CANCELLED')
          .reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);

        const statusMap = orders.reduce((acc, ord) => {
          acc[ord.status] = (acc[ord.status] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          totalFoods: foods.length,
          totalUsers: users.length,
          statusCounts: statusMap,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        setError('Lỗi khi tải dữ liệu thống kê: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="mt-2 text-muted small">Đang tải dữ liệu tổng quan...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Tổng Quan Quản Trị</h3>
          <p className="text-secondary small mb-0">Báo cáo doanh thu, số lượng đơn hàng và người dùng.</p>
        </div>
        <div className="d-flex gap-2">
          <Button as={Link} to="/admin/foods" variant="danger" size="sm">
            Quản lý món ăn
          </Button>
          <Button as={Link} to="/admin/orders" variant="outline-secondary" size="sm">
            Quản lý đơn hàng
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col lg={3} sm={6}>
          <Card className="p-3 border bg-white">
            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Tổng doanh thu</small>
            <h4 className="fw-bold text-success mb-0 mt-1">
              {stats.totalRevenue.toLocaleString('vi-VN')}đ
            </h4>
          </Card>
        </Col>

        <Col lg={3} sm={6}>
          <Card className="p-3 border bg-white">
            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Tổng đơn hàng</small>
            <h4 className="fw-bold text-primary mb-0 mt-1">{stats.totalOrders} đơn</h4>
          </Card>
        </Col>

        <Col lg={3} sm={6}>
          <Card className="p-3 border bg-white">
            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Tổng số món</small>
            <h4 className="fw-bold text-danger mb-0 mt-1">{stats.totalFoods} món</h4>
          </Card>
        </Col>

        <Col lg={3} sm={6}>
          <Card className="p-3 border bg-white">
            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>Người dùng</small>
            <h4 className="fw-bold text-dark mb-0 mt-1">{stats.totalUsers} tài khoản</h4>
          </Card>
        </Col>
      </Row>

      {/* Order Status Breakdown */}
      <Card className="border p-3 mb-4 bg-white">
        <h6 className="fw-bold mb-3">Tình Trạng Đơn Hàng</h6>
        <Row className="g-2 text-center">
          <Col md>
            <div className="p-2 border rounded bg-light">
              <div className="text-warning fs-4 fw-bold">{stats.statusCounts['PENDING'] || 0}</div>
              <small className="text-muted">Chờ xác nhận</small>
            </div>
          </Col>
          <Col md>
            <div className="p-2 border rounded bg-light">
              <div className="text-info fs-4 fw-bold">{stats.statusCounts['PREPARING'] || 0}</div>
              <small className="text-muted">Đang chế biến</small>
            </div>
          </Col>
          <Col md>
            <div className="p-2 border rounded bg-light">
              <div className="text-primary fs-4 fw-bold">{stats.statusCounts['DELIVERING'] || 0}</div>
              <small className="text-muted">Đang giao hàng</small>
            </div>
          </Col>
          <Col md>
            <div className="p-2 border rounded bg-light">
              <div className="text-success fs-4 fw-bold">{stats.statusCounts['DELIVERED'] || 0}</div>
              <small className="text-muted">Đã giao thành công</small>
            </div>
          </Col>
          <Col md>
            <div className="p-2 border rounded bg-light">
              <div className="text-secondary fs-4 fw-bold">{stats.statusCounts['CANCELLED'] || 0}</div>
              <small className="text-muted">Đã hủy</small>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Recent Orders */}
      <Card className="border p-3 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0">Đơn Hàng Gần Đây</h6>
          <Button as={Link} to="/admin/orders" variant="outline-danger" size="sm">
            Xem tất cả đơn
          </Button>
        </div>

        <Table responsive hover className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((ord) => (
              <tr key={ord.id}>
                <td className="fw-bold text-danger small">{ord.orderCode}</td>
                <td className="small">{ord.customerName}</td>
                <td className="small">{ord.customerPhone}</td>
                <td className="small fw-semibold">{ord.totalAmount?.toLocaleString('vi-VN')}đ</td>
                <td>
                  <OrderStatusBadge status={ord.status} />
                </td>
                <td className="small text-muted">
                  {ord.createdAt ? new Date(ord.createdAt).toLocaleString('vi-VN') : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
