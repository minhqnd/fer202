import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Modal,
  Badge,
  Spinner,
  Alert,
  ListGroup,
} from 'react-bootstrap';
import api, { endpoints } from '../../config/api';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'PREPARING', label: 'Đang chế biến' },
  { value: 'DELIVERING', label: 'Đang giao hàng' },
  { value: 'DELIVERED', label: 'Đã giao thành công' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`${endpoints.orders}?_sort=createdAt&_order=desc`);
      setOrders(res.data);
    } catch (err) {
      setError('Lỗi khi tải đơn hàng: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`${endpoints.orders}/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Không thể cập nhật trạng thái đơn: ' + err.message);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchSearch =
      !q ||
      ord.orderCode.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      (ord.customerPhone && ord.customerPhone.includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Quản Lý Đơn Hàng</h3>
          <p className="text-secondary small mb-0">Xác nhận đơn, chuyển bếp và theo dõi giao hàng cho khách.</p>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={fetchOrders}>
          Làm mới
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border p-3 mb-4 bg-white">
        <Row className="g-3">
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Alert variant="info" className="text-center py-4">
          Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
        </Alert>
      ) : (
        <Card className="border p-3 bg-white">
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng & SĐT</th>
                <th>Địa chỉ giao</th>
                <th>Tổng thanh toán</th>
                <th>Thanh toán</th>
                <th style={{ minWidth: 160 }}>Cập nhật trạng thái</th>
                <th className="text-end">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <div className="fw-semibold text-danger small">{ord.orderCode}</div>
                    <small className="text-muted">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString('vi-VN') : ''}
                    </small>
                  </td>
                  <td>
                    <div className="fw-semibold small">{ord.customerName}</div>
                    <small className="text-muted">{ord.customerPhone}</small>
                  </td>
                  <td className="small text-truncate" style={{ maxWidth: 220 }} title={ord.deliveryAddress}>
                    {ord.deliveryAddress}
                  </td>
                  <td>
                    <div className="fw-semibold text-dark small">
                      {ord.totalAmount?.toLocaleString('vi-VN')}đ
                    </div>
                  </td>
                  <td>
                    <Badge bg="light" text="dark" className="border">
                      {ord.paymentMethod}
                    </Badge>
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                    >
                      <option value="PENDING">Chờ xác nhận</option>
                      <option value="PREPARING">Đang chế biến</option>
                      <option value="DELIVERING">Đang giao hàng</option>
                      <option value="DELIVERED">Đã giao thành công</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </Form.Select>
                  </td>
                  <td className="text-end">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(ord);
                        setShowModal(true);
                      }}
                    >
                      Xem
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        {selectedOrder && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold fs-6">
                Chi tiết đơn hàng: {selectedOrder.orderCode}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <div className="p-3 bg-light rounded border small">
                    <div className="fw-bold mb-2">Thông tin khách hàng:</div>
                    <div>Họ tên: {selectedOrder.customerName}</div>
                    <div>Số điện thoại: {selectedOrder.customerPhone}</div>
                    <div>Địa chỉ: {selectedOrder.deliveryAddress}</div>
                    {selectedOrder.notes && (
                      <div className="mt-1 text-danger">Ghi chú: {selectedOrder.notes}</div>
                    )}
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 bg-light rounded border small">
                    <div className="fw-bold mb-2">Trạng thái & Thanh toán:</div>
                    <div className="mb-2">
                      <span className="me-2">Hiện tại:</span>
                      <OrderStatusBadge status={selectedOrder.status} />
                    </div>
                    <div>Phương thức: {selectedOrder.paymentMethod}</div>
                    <div>
                      Thời gian đặt: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="fw-bold mb-2 small">Món ăn đã đặt ({selectedOrder.items?.length}):</div>
              <ListGroup variant="flush" className="border rounded mb-3">
                {selectedOrder.items?.map((it, idx) => (
                  <ListGroup.Item
                    key={idx}
                    className="d-flex justify-content-between align-items-center py-2"
                  >
                    <div>
                      <div className="fw-semibold small">{it.name}</div>
                      <small className="text-muted">
                        {it.price.toLocaleString('vi-VN')}đ x {it.quantity}
                      </small>
                    </div>
                    <span className="small text-danger fw-semibold">
                      {(it.price * it.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {/* Total Summary */}
              <div className="p-3 bg-light border rounded small">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Tạm tính:</span>
                  <span>{selectedOrder.subtotal?.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Phí giao hàng:</span>
                  <span>{selectedOrder.shippingFee?.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="d-flex justify-content-between pt-2 border-top fw-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-danger">
                    {selectedOrder.totalAmount?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                Đóng
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default AdminOrders;
