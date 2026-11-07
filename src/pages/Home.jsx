import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api, { endpoints } from '../config/api';
import FoodCard from '../components/food/FoodCard';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, foodRes] = await Promise.all([
          api.get(endpoints.categories),
          api.get(endpoints.foods),
        ]);
        setCategories(catRes.data);
        setFeaturedFoods(foodRes.data.filter((f) => f.isFeatured));
      } catch (err) {
        setError('Không thể tải dữ liệu: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  return (
    <div>
      {/* Clean Hero Section */}
      <div className="bg-white border-bottom py-5 mb-4">
        <Container>
          <Row className="align-items-center gy-4">
            <Col lg={7}>
              <h1 className="display-5 fw-bold mb-3 text-dark">
                Cửa Hàng Đặt Đồ Ăn Nhanh Trực Tuyến
              </h1>
              <p className="lead text-secondary mb-4">
                Thực đơn đa dạng với bánh burger, gà rán, pizza và các món ăn kèm chất lượng. Đặt món dễ dàng và giao tận nơi.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Button as={Link} to="/menu" variant="danger" size="lg">
                  Xem thực đơn
                </Button>
                <Button
                  as={Link}
                  to="/menu?cat=combo-tiet-kiem"
                  variant="outline-secondary"
                  size="lg"
                >
                  Combo tiết kiệm
                </Button>
              </div>
            </Col>
            <Col lg={5} className="text-center">
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80"
                alt="Burger"
                className="img-fluid rounded border"
                style={{ maxHeight: 320, objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Category Section */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Danh mục món ăn</h4>
            <Button as={Link} to="/menu" variant="outline-danger" size="sm">
              Xem tất cả
            </Button>
          </div>

          <Row className="g-3">
            {categories.map((cat) => (
              <Col key={cat.id} lg={2} md={4} sm={6} xs={6}>
                <Card
                  className="h-100 category-card text-center overflow-hidden"
                  onClick={() => navigate(`/menu?cat=${cat.id}`)}
                >
                  <div style={{ height: 100, overflow: 'hidden' }}>
                    <Card.Img
                      variant="top"
                      src={cat.image}
                      alt={cat.name}
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <Card.Body className="p-2">
                    <Card.Title className="fs-6 fw-bold mb-0">{cat.name}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Featured Foods Section */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Món ăn nổi bật</h4>
            <Button as={Link} to="/menu" variant="danger" size="sm">
              Khám phá thực đơn
            </Button>
          </div>

          <Row className="g-3">
            {featuredFoods.slice(0, 8).map((food) => {
              const cat = categories.find((c) => c.id === food.categoryId);
              return (
                <Col key={food.id} xl={3} lg={4} md={6} sm={6}>
                  <FoodCard food={food} categoryName={cat?.name} />
                </Col>
              );
            })}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Home;
