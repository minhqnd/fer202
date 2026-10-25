import { useEffect, useState } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { createOrder, getVouchers } from "../config/api";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    paymentMethod: "COD",
    notes: "",
  });

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));

    getVouchers()
      .then((response) => setVouchers(response.data))
      .catch(() => setMessage("Không thể tải danh sách voucher."));
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0,
  );

  const shippingFee = subtotal > 0 ? 20000 : 0;

  const applyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();

    const voucher = vouchers.find(
      (item) =>
        item.code.toUpperCase() === code &&
        item.isActive === true &&
        new Date(item.expiryDate) >= new Date() &&
        subtotal >= Number(item.minOrderValue || 0),
    );

    if (!voucher) {
      setAppliedVoucher(null);
      setMessage("Voucher không hợp lệ, đã hết hạn hoặc chưa đủ điều kiện.");
      return;
    }

    setAppliedVoucher(voucher);
    setMessage("Áp dụng voucher thành công.");
  };

  let discountAmount = 0;
  let finalShippingFee = shippingFee;

  if (appliedVoucher) {
    if (appliedVoucher.discountType === "FIXED") {
      discountAmount = Number(appliedVoucher.discountAmount || 0);
    } else if (appliedVoucher.discountType === "PERCENT") {
      discountAmount =
        (subtotal * Number(appliedVoucher.discountPercent || 0)) / 100;

      if (appliedVoucher.maxDiscount) {
        discountAmount = Math.min(
          discountAmount,
          Number(appliedVoucher.maxDiscount),
        );
      }
    } else if (appliedVoucher.discountType === "SHIPPING") {
      finalShippingFee = 0;
    }
  }

  discountAmount = Math.min(discountAmount, subtotal);

  const totalAmount = Math.max(0, subtotal + finalShippingFee - discountAmount);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      setMessage("Giỏ hàng đang trống.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const order = {
        orderCode: `ORD-${Date.now()}`,
        userId: null,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        items: cart.map((item) => ({
          foodId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image,
        })),
        subtotal,
        shippingFee: finalShippingFee,
        discountAmount,
        voucherCode: appliedVoucher?.code || "",
        totalAmount,
        paymentMethod: form.paymentMethod,
        status: "PENDING",
        notes: form.notes.trim(),
        createdAt: new Date().toISOString(),
      };

      await createOrder(order);

      localStorage.removeItem("cart");
      navigate("/orders");
    } catch (error) {
      setMessage("Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + "đ";

  return (
    <Container className="py-4">
      <h2 className="mb-4">Thanh toán</h2>

      {message && (
        <Alert
          variant={message.includes("thành công") ? "success" : "danger"}
          dismissible
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      {cart.length === 0 ? (
        <Alert variant="info">
          Giỏ hàng đang trống.
          <div className="mt-3">
            <Button as={Link} to="/foods" variant="warning">
              Chọn món ăn
            </Button>
          </div>
        </Alert>
      ) : (
        <Row className="g-4">
          <Col lg={7}>
            <Card>
              <Card.Body>
                <h4 className="mb-3">Thông tin giao hàng</h4>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Họ và tên</Form.Label>
                    <Form.Control
                      name="customerName"
                      value={form.customerName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                      type="tel"
                      name="customerPhone"
                      value={form.customerPhone}
                      onChange={handleChange}
                      pattern="[0-9]{10,11}"
                      title="Số điện thoại gồm 10 đến 11 chữ số"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ giao hàng</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="deliveryAddress"
                      value={form.deliveryAddress}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phương thức thanh toán</Form.Label>
                    <Form.Select
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={handleChange}
                    >
                      <option value="COD">Thanh toán khi nhận hàng</option>
                      <option value="BANK_TRANSFER">Chuyển khoản</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="warning"
                    disabled={loading || cart.length === 0}
                  >
                    {loading ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card>
              <Card.Body>
                <h4 className="mb-3">Đơn hàng của bạn</h4>

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between mb-2"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}

                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Mã voucher</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      value={voucherCode}
                      onChange={(event) => setVoucherCode(event.target.value)}
                      placeholder="Nhập mã giảm giá"
                    />
                    <Button variant="outline-dark" onClick={applyVoucher}>
                      Áp dụng
                    </Button>
                  </div>
                </Form.Group>

                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Phí giao hàng</span>
                  <span>{formatPrice(finalShippingFee)}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Giảm giá</span>
                  <span className="text-success">
                    -{formatPrice(discountAmount)}
                  </span>
                </div>

                <hr />

                <div className="d-flex justify-content-between">
                  <strong>Tổng thanh toán</strong>
                  <strong className="text-danger">
                    {formatPrice(totalAmount)}
                  </strong>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Checkout;
