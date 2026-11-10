import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  ListGroup,
  Badge,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { endpoints } from '../config/api';

const Checkout = () => {
  const {
    cartItems,
    subtotal,
    shippingFee,
    finalTotal,
    clearCart,
  } = useCart();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    customerName: currentUser?.fullName || '',
    customerPhone: currentUser?.phone || '',
    deliveryAddress: currentUser?.address || '',
    paymentMethod: 'COD',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'Vui lòng nhập họ và tên';
    }
    if (!formData.customerPhone.trim()) {
      errs.customerPhone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{9,11}$/.test(formData.customerPhone.trim())) {
      errs.customerPhone = 'Số điện thoại không hợp lệ (9-11 chữ số)';
    }
    if (!formData.deliveryAddress.trim()) {
      errs.deliveryAddress = 'Vui lòng nhập địa chỉ nhận hàng chi tiết';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (cartItems.length === 0) return;

    try {
      setSubmitting(true);
      const now = new Date();
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const orderCode = `ORD-${dateStr}-${randomSuffix}`;

      const newOrder = {
        orderCode,
        userId: currentUser?.id || null,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        deliveryAddress: formData.deliveryAddress.trim(),
        items: cartItems.map((item) => ({
          foodId: item.foodId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal,
        shippingFee,
        totalAmount: finalTotal,
        paymentMethod: formData.paymentMethod,
        status: 'PENDING',
        notes: formData.notes.trim(),
        createdAt: now.toISOString(),
      };

      const res = await api.post(endpoints.orders, newOrder);
      setOrderSuccess(res.data);
      clearCart();
    } catch (err) {
      alert('Lỗi đặt hàng: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <Container className="py-5 text-center">
        <Card className="border p-4 mx-auto bg-white" style={{ maxWidth: 540 }}>
          <h3 className="fw-bold text-success mb-2">Đặt Hàng Thành Công</h3>
          <p className="text-muted small">
            Đơn hàng của bạn đã được ghi nhận vào hệ thống.
          </p>

          <div className="bg-light p-3 rounded text-start my-3 border small">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Mã đơn hàng:</span>
              <strong className="text-danger">{orderSuccess.orderCode}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Người nhận:</span>
              <span>{orderSuccess.customerName} ({orderSuccess.customerPhone})</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Địa chỉ giao:</span>
              <span>{orderSuccess.deliveryAddress}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Phương thức thanh toán:</span>
              <Badge bg="secondary">{orderSuccess.paymentMethod}</Badge>
            </div>
            <div className="d-flex justify-content-between pt-2 border-top">
              <span className="fw-bold">Tổng thanh toán:</span>
              <strong className="text-danger fs-6">
                {orderSuccess.totalAmount.toLocaleString('vi-VN')}đ
              </strong>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-center">
            {currentUser && (
              <Button as={Link} to="/orders" variant="danger" size="sm">
                Xem đơn hàng của tôi
              </Button>
            )}
            <Button as={Link} to="/menu" variant="outline-secondary" size="sm">
              Tiếp tục đặt món
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning" className="d-inline-block p-4">
          <h6>Giỏ hàng đang trống</h6>
          <p className="small mb-3">Bạn chưa có món ăn nào trong giỏ hàng để thanh toán.</p>
          <Button as={Link} to="/menu" variant="danger" size="sm">
            Quay lại thực đơn
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-4">Xác Nhận Đơn Hàng & Thanh Toán</h3>

      <Form onSubmit={handleSubmit}>
        <Row className="gy-4">
          {/* Customer & Delivery Form */}
          <Col lg={7}>
            <Card className="border p-4 mb-4 bg-white">
              <h6 className="fw-bold mb-3 border-bottom pb-2">Thông Tin Nhận Hàng</h6>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Họ và tên người nhận</Form.Label>
                <Form.Control
                  type="text"
                  name="customerName"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.customerName}
                  onChange={handleChange}
                  isInvalid={!!errors.customerName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.customerName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Số điện thoại liên hệ</Form.Label>
                <Form.Control
                  type="tel"
                  name="customerPhone"
                  placeholder="Ví dụ: 0912345678"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  isInvalid={!!errors.customerPhone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.customerPhone}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Địa chỉ giao hàng</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="deliveryAddress"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  isInvalid={!!errors.deliveryAddress}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.deliveryAddress}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Ghi chú cho đơn hàng</Form.Label>
                <Form.Control
                  type="text"
                  name="notes"
                  placeholder="Ví dụ: Giao giờ hành chính..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Form.Group>
            </Card>

            {/* Payment Methods */}
            <Card className="border p-4 bg-white">
              <h6 className="fw-bold mb-3 border-bottom pb-2">Phương Thức Thanh Toán</h6>

              <Form.Check
                type="radio"
                id="payment-cod"
                name="paymentMethod"
                value="COD"
                checked={formData.paymentMethod === 'COD'}
                onChange={handleChange}
                label="Thanh toán tiền mặt khi nhận hàng (COD)"
                className="mb-2"
              />

              <Form.Check
                type="radio"
                id="payment-momo"
                name="paymentMethod"
                value="MOMO"
                checked={formData.paymentMethod === 'MOMO'}
                onChange={handleChange}
                label="Ví điện tử MoMo"
                className="mb-2"
              />

              <Form.Check
                type="radio"
                id="payment-bank"
                name="paymentMethod"
                value="BANK"
                checked={formData.paymentMethod === 'BANK'}
                onChange={handleChange}
                label="Chuyển khoản ngân hàng (VietQR)"
              />
            </Card>
          </Col>

          {/* Order Review Sidebar */}
          <Col lg={5}>
            <Card className="border p-4 bg-white">
              <h6 className="fw-bold mb-3 border-bottom pb-2">
                Đơn Hàng ({cartItems.length} món)
              </h6>

              <ListGroup variant="flush" className="mb-3">
                {cartItems.map((item) => (
                  <ListGroup.Item
                    key={item.foodId}
                    className="px-0 py-2 d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-semibold small">{item.name}</div>
                      <small className="text-muted">Số lượng: {item.quantity}</small>
                    </div>
                    <span className="small text-danger fw-semibold">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Tạm tính:</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Phí giao hàng:</span>
                <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <span className="fw-bold">Tổng thanh toán:</span>
                <span className="fs-4 fw-bold text-danger">
                  {finalTotal.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <Button
                type="submit"
                variant="danger"
                className="w-100 fw-semibold"
                disabled={submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Checkout;
