import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Badge,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getOrders } from "../config/api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrders()
      .then((response) => {
        setOrders(
          response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      })
      .catch(() => {
        setError("Không thể tải danh sách đơn hàng.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + "đ";

  const getStatus = (status) => {
    const statuses = {
      PENDING: { text: "Chờ xác nhận", variant: "warning" },
      CONFIRMED: { text: "Đã xác nhận", variant: "primary" },
      PREPARING: { text: "Đang chuẩn bị", variant: "info" },
      SHIPPING: { text: "Đang giao", variant: "primary" },
      DELIVERED: { text: "Đã giao", variant: "success" },
      COMPLETED: { text: "Hoàn thành", variant: "success" },
      CANCELLED: { text: "Đã hủy", variant: "danger" },
    };

    return (
      statuses[status] || {
        text: status || "Chưa xác định",
        variant: "secondary",
      }
    );
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Đơn hàng của tôi</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {!error && orders.length === 0 && (
        <Alert variant="info">
          Bạn chưa có đơn hàng nào.
          <div className="mt-3">
            <Button as={Link} to="/foods" variant="warning">
              Đặt món ngay
            </Button>
          </div>
        </Alert>
      )}

      {!error &&
        orders.map((order) => {
          const status = getStatus(order.status);

          return (
            <Card key={order.id} className="mb-3">
              <Card.Body>
                <Row className="align-items-center g-3">
                  <Col md={4}>
                    <h5>{order.orderCode}</h5>
                    <p className="mb-1">
                      Ngày đặt:{" "}
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </p>
                    <p className="mb-0">
                      {order.items?.length || 0} loại món ăn
                    </p>
                  </Col>

                  <Col md={3}>
                    <p className="mb-1">Trạng thái</p>
                    <Badge bg={status.variant}>{status.text}</Badge>
                  </Col>

                  <Col md={3}>
                    <p className="mb-1">Tổng tiền</p>
                    <strong className="text-danger">
                      {formatPrice(order.totalAmount)}
                    </strong>
                  </Col>

                  <Col md={2}>
                    <Button
                      as={Link}
                      to={`/orders/${order.id}`}
                      variant="outline-dark"
                      size="sm"
                    >
                      Chi tiết
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}
    </Container>
  );
}

export default MyOrders;
