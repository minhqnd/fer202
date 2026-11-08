import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Table,
  Button,
  Badge,
  Modal,
  Alert,
  Spinner,
  Card,
  ListGroup,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api, { endpoints } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import OrderStatusBadge from '../components/order/OrderStatusBadge';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = currentUser?.id
        ? `${endpoints.orders}?userId=${currentUser.id}&_sort=createdAt&_order=desc`
        : `${endpoints.orders}?_sort=createdAt&_order=desc`;
      const res = await api.get(url);
      setOrders(res.data);
    } catch (err) {
      setError('Lỗi khi tải danh sách đơn hàng: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      setCancellingId(orderId);
      await api.patch(`${endpoints.orders}/${orderId}`, { status: 'CANCELLED' });
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'CANCELLED' } : ord))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: 'CANCELLED' }));
      }
    } catch (err) {
      alert('Không thể hủy đơn hàng: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = (order) => {
    if (!order.items) return;
    order.items.forEach((item) => {
      addToCart(
        {
          id: item.foodId,
          name: item.name,
          price: item.price,
          image: item.image,
        },
        item.quantity
      );
    });
    alert('Đã thêm các món vào giỏ hàng.');
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Lịch Sử Đơn Hàng</h3>
          <p className="text-secondary small mb-0">
            Theo dõi tình trạng chế biến và giao hàng của các đơn đã đặt.
          </p>
        </div>
        <Button as={Link} to="/menu" variant="outline-danger" size="sm">
          Đặt thêm món
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted small">Đang tải lịch sử đơn hàng...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : orders.length === 0 ? (
        <Card className="text-center p-5 border bg-white">
          <h5 className="fw-bold">Bạn chưa có đơn hàng nào</h5>
          <p className="text-muted small">Khám phá các món ăn từ thực đơn của quán.</p>
          <div>
            <Button as={Link} to="/menu" variant="danger" size="sm">
              Xem thực đơn
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border p-3 bg-white">
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Số món</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const totalItems = order.items
                  ? order.items.reduce((acc, it) => acc + it.quantity, 0)
                  : 0;
                return (
                  <tr key={order.id}>
                    <td>
                      <span className="fw-bold text-danger small">{order.orderCode}</span>
                    </td>
                    <td className="small text-muted">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString('vi-VN')
                        : 'Mới đây'}
                    </td>
                    <td className="small">{totalItems} món</td>
                    <td className="fw-semibold text-dark small">
                      {order.totalAmount?.toLocaleString('vi-VN')}đ
                    </td>
                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {order.paymentMethod}
                      </Badge>
                    </td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenDetail(order)}
                      >
                        Chi tiết
                      </Button>
                      {order.status === 'PENDING' && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          disabled={cancellingId === order.id}
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          {cancellingId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Modal Detail */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        {selectedOrder && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold fs-6">
                Chi tiết đơn hàng: {selectedOrder.orderCode}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded border">
                <div>
                  <small className="text-muted d-block mb-1">Trạng thái:</small>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                <div className="text-end">
                  <small className="text-muted d-block mb-1">Thời gian đặt:</small>
                  <span className="small fw-semibold">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <div className="p-3 border rounded mb-3 small bg-white">
                <div className="fw-bold mb-1">Thông tin giao nhận:</div>
                <div>Họ tên: {selectedOrder.customerName}</div>
                <div>Điện thoại: {selectedOrder.customerPhone}</div>
                <div>Địa chỉ: {selectedOrder.deliveryAddress}</div>
                {selectedOrder.notes && (
                  <div className="text-muted mt-1">Ghi chú: {selectedOrder.notes}</div>
                )}
              </div>

              <div className="fw-bold mb-2 small">Món đã đặt:</div>
              <ListGroup variant="flush" className="border rounded mb-3">
                {selectedOrder.items?.map((it, idx) => (
                  <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center py-2">
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

              {/* Summary */}
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
                  <span>Tổng cộng ({selectedOrder.paymentMethod}):</span>
                  <span className="text-danger">
                    {selectedOrder.totalAmount?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-success" size="sm" onClick={() => handleReorder(selectedOrder)}>
                Đặt lại đơn này
              </Button>
              {selectedOrder.status === 'PENDING' && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                >
                  Hủy đơn
                </Button>
              )}
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

export default OrderHistory;
