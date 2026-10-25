import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import { getFoods, getCategories } from "../config/api";

function FoodList() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("category") || "",
  );
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodResponse, categoryResponse] = await Promise.all([
          getFoods(),
          getCategories(),
        ]);

        setFoods(foodResponse.data);
        setCategories(categoryResponse.data);
      } catch (error) {
        setError("Không thể tải danh sách món ăn.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setKeyword(searchParams.get("search") || "");
    setCategoryId(searchParams.get("category") || "");
  }, [searchParams]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setKeyword(value);

    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    setSearchParams(params, { replace: true });
  };

  const filteredFoods = foods
    .filter((food) =>
      food.name.toLowerCase().includes(keyword.trim().toLowerCase()),
    )
    .filter(
      (food) =>
        categoryId === "" || String(food.categoryId) === String(categoryId),
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return Number(a.price) - Number(b.price);
      }

      if (sortOrder === "desc") {
        return Number(b.price) - Number(a.price);
      }

      return 0;
    });

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Danh sách món ăn</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-3 mb-4">
        <Col md={5}>
          <Form.Control
            type="search"
            placeholder="Tìm món ăn..."
            value={keyword}
            onChange={handleSearch}
          />
        </Col>

        <Col md={4}>
          <Form.Select
            value={categoryId}
            onChange={(event) => {
              const value = event.target.value;
              setCategoryId(value);

              const params = new URLSearchParams(searchParams);

              if (value) {
                params.set("category", value);
              } else {
                params.delete("category");
              }

              setSearchParams(params);
            }}
          >
            <option value="">Tất cả danh mục</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="">Sắp xếp giá</option>
            <option value="asc">Giá tăng dần</option>
            <option value="desc">Giá giảm dần</option>
          </Form.Select>
        </Col>
      </Row>

      <p>Tìm thấy {filteredFoods.length} món ăn</p>

      {filteredFoods.length === 0 ? (
        <Alert variant="info">Không tìm thấy món ăn phù hợp.</Alert>
      ) : (
        <Row className="g-4">
          {filteredFoods.map((food) => (
            <Col key={food.id} xs={6} md={4} lg={3}>
              <Card className="h-100">
                <Card.Img
                  variant="top"
                  src={food.image}
                  alt={food.name}
                  style={{
                    height: "180px",
                    objectFit: "cover",
                  }}
                />

                <Card.Body className="d-flex flex-column">
                  <Card.Title>{food.name}</Card.Title>

                  <Card.Text className="text-danger fw-bold">
                    {Number(food.price).toLocaleString("vi-VN")}đ
                  </Card.Text>

                  <Card.Text>⭐ {food.rating}</Card.Text>

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
      )}
    </Container>
  );
}

export default FoodList;
