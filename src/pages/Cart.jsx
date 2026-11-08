import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    subtotal,
    shippingFee,
    finalTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Card className="border p-5 mx-auto bg-white" style={{ maxWidth: 480 }}>
          <h4 className="fw-bold mb-2">Giỏ hàng của bạn đang trống</h4>
          <p className="text-secondary small mb-4">
            Hãy lựa chọn món ăn yêu thích từ thực đơn của chúng tôi.
          </p>
          <div>
            <Button as={Link} to="/menu" variant="danger">
              Xem thực đơn món ăn
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-4">Giỏ Hàng</h3>

      <Row className="gy-4">
        {/* Cart items list */}
        <Col lg={8}>
          <Card className="border p-3 mb-3 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Danh sách món đã chọn ({cartItems.length})</h6>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={clearCart}
              >
                Xóa tất cả
              </Button>
            </div>

            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: 200 }}>Món ăn</th>
                  <th>Đơn giá</th>
                  <th style={{ width: 130 }}>Số lượng</th>
                  <th>Thành tiền</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.foodId}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 6,
                          }}
                          className="me-2"
                        />
                        <div>
                          <Link
                            to={`/foods/${item.foodId}`}
                            className="text-decoration-none text-dark fw-semibold small"
                          >
                            {item.name}
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td className="small">
                      {item.price.toLocaleString('vi-VN')}đ
                    </td>

                    <td>
                      <div className="d-flex align-items-center border rounded px-1 py-1" style={{ width: 'fit-content' }}>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-dark p-0 px-2 text-decoration-none"
                          onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="px-2 small fw-semibold">{item.quantity}</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-dark p-0 px-2 text-decoration-none"
                          onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </td>

                    <td className="fw-semibold text-danger small">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </td>

                    <td className="text-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => removeFromCart(item.foodId)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          <Button as={Link} to="/menu" variant="outline-secondary" size="sm">
            Tiếp tục chọn món
          </Button>
        </Col>

        {/* Order Summary */}
        <Col lg={4}>
          <Card className="border p-4 bg-white">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Tóm Tắt Đơn Hàng</h6>

            {/* Price breakdown */}
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
              variant="danger"
              className="w-100 fw-semibold"
              onClick={() => navigate('/checkout')}
            >
              Tiến hành thanh toán
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
