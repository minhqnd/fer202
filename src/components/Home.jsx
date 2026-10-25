import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getCategories, getFoods } from "../config/api";

function Home() {
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryResponse, foodResponse] = await Promise.all([
          getCategories(),
          getFoods(),
        ]);

        setCategories(categoryResponse.data);
        setFoods(foodResponse.data.filter((food) => food.isFeatured));
      } catch (error) {
        setError("Không thể tải dữ liệu. Hãy kiểm tra JSON Server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container className="py-4">
      <div className="bg-warning rounded p-5 mb-4 text-center">
        <h1>Chào mừng đến với FastFood!</h1>
        <p className="lead">Món ngon yêu thích, đặt hàng nhanh chóng.</p>
        <Button as={Link} to="/foods" variant="dark">
          Khám phá món ăn
        </Button>
      </div>

      <h2 className="mb-3">Danh mục món ăn</h2>

      <Row className="g-3 mb-5">
        {categories.map((category) => (
          <Col key={category.id} xs={6} md={4} lg={2}>
            <Card className="h-100 text-center">
              <Card.Img
                variant="top"
                src={category.image}
                alt={category.name}
                style={{ height: "100px", objectFit: "cover" }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fs-6">{category.name}</Card.Title>
                <Button
                  as={Link}
                  to={`/foods?category=${category.id}`}
                  variant="outline-dark"
                  size="sm"
                  className="mt-auto"
                >
                  Xem món
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h2 className="mb-3">Món ăn nổi bật</h2>

      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && foods.length === 0 && (
        <Alert variant="info">Hiện chưa có món ăn nổi bật.</Alert>
      )}

      <Row className="g-4">
        {foods.slice(0, 8).map((food) => (
          <Col key={food.id} xs={6} md={4} lg={3}>
            <Card className="h-100">
              <Card.Img
                variant="top"
                src={food.image}
                alt={food.name}
                style={{ height: "180px", objectFit: "cover" }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{food.name}</Card.Title>

                <Card.Text className="text-danger fw-bold">
                  {Number(food.price).toLocaleString("vi-VN")}đ
                </Card.Text>

                <Card.Text>
                  ⭐ {food.rating} · {food.preparationTime} phút
                </Card.Text>

                <Button
                  as={Link}
                  to={`/foods/${food.id}`}
                  variant="warning"
                  className="mt-auto"
                >
                  Xem chi tiết
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Home;
