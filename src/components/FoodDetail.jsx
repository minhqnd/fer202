import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { getFoodById, getReviewsByFoodId } from "../config/api";

function FoodDetail() {
  const { id } = useParams();

  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodResponse, reviewResponse] = await Promise.all([
          getFoodById(id),
          getReviewsByFoodId(id),
        ]);

        setFood(foodResponse.data);
        setReviews(reviewResponse.data);
      } catch (error) {
        setError("Không thể tải thông tin món ăn.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!food || !food.isAvailable) {
      setMessage("Món ăn hiện không có sẵn.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingFood = cart.find(
      (item) => String(item.id) === String(food.id),
    );

    if (existingFood) {
      existingFood.quantity += Number(quantity);
    } else {
      cart.push({
        id: food.id,
        name: food.name,
        price: Number(food.price),
        image: food.image,
        quantity: Number(quantity),
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setMessage("Đã thêm món ăn vào giỏ hàng!");
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error || !food) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error || "Không tìm thấy món ăn."}</Alert>
        <Button as={Link} to="/foods" variant="secondary">
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {message && (
        <Alert
          variant={message.includes("Đã thêm") ? "success" : "warning"}
          dismissible
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      <Row className="g-4">
        <Col md={5}>
          <Card>
            <Card.Img
              variant="top"
              src={food.image}
              alt={food.name}
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          </Card>
        </Col>

        <Col md={7}>
          <h2>{food.name}</h2>

          <p className="text-danger fs-3 fw-bold">
            {Number(food.price).toLocaleString("vi-VN")}đ
          </p>

          {food.originalPrice > food.price && (
            <p className="text-muted text-decoration-line-through">
              {Number(food.originalPrice).toLocaleString("vi-VN")}đ
            </p>
          )}

          <p>⭐ {food.rating || 0}/5</p>
          <p>Thời gian chuẩn bị: {food.preparationTime} phút</p>
          <p>Năng lượng: {food.calories} kcal</p>
          <p>{food.description}</p>

          <p>Trạng thái: {food.isAvailable ? "Còn hàng" : "Hết hàng"}</p>

          <Form.Group className="mb-3">
            <Form.Label>Số lượng</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(event) => {
                const value = Number(event.target.value);

                if (value >= 1 && value <= 99) {
                  setQuantity(value);
                }
              }}
              style={{ maxWidth: "120px" }}
            />
          </Form.Group>

          <Button
            variant="warning"
            className="me-2"
            disabled={!food.isAvailable}
            onClick={handleAddToCart}
          >
            Thêm vào giỏ hàng
          </Button>

          <Button as={Link} to="/cart" variant="dark">
            Xem giỏ hàng
          </Button>
        </Col>
      </Row>

      <hr className="my-5" />

      <h3>Đánh giá của khách hàng</h3>

      {reviews.length === 0 ? (
        <Alert variant="info">Chưa có đánh giá cho món ăn này.</Alert>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} className="mb-3">
            <Card.Body>
              <Card.Title>{review.userName}</Card.Title>
              <p>{"⭐".repeat(Number(review.rating) || 0)}</p>
              <Card.Text>{review.comment}</Card.Text>
              <small className="text-muted">
                {review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                  : ""}
              </small>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}

export default FoodDetail;
