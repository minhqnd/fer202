import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Form,
  ListGroup,
} from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import api, { endpoints } from '../config/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import FoodCard from '../components/food/FoodCard';

const FoodDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  const [food, setFood] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedFoods, setRelatedFoods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setAdded(false);
        setQuantity(1);

        const foodRes = await api.get(`${endpoints.foods}/${id}`);
        setFood(foodRes.data);

        const [catRes, allFoodsRes, revRes] = await Promise.all([
          api.get(`${endpoints.categories}/${foodRes.data.categoryId}`).catch(() => ({ data: null })),
          api.get(`${endpoints.foods}?categoryId=${foodRes.data.categoryId}`),
          api.get(`${endpoints.reviews}?foodId=${id}`),
        ]);

        setCategory(catRes.data);
        setRelatedFoods(allFoodsRes.data.filter((f) => String(f.id) !== String(id)).slice(0, 4));
        setReviews(revRes.data);
      } catch (err) {
        setError('Không tìm thấy thông tin món ăn: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleAddToCart = () => {
    if (!food) return;
    addToCart(food, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      const newReview = {
        foodId: Number(id),
        userId: currentUser?.id || 999,
        userName: currentUser?.fullName || 'Khách vãng lai',
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
        createdAt: new Date().toISOString(),
      };

      const res = await api.post(endpoints.reviews, newReview);
      setReviews((prev) => [res.data, ...prev]);
      setReviewComment('');
      setReviewRating(5);
      setReviewMsg('Cảm ơn bạn đã gửi đánh giá món ăn.');
      setTimeout(() => setReviewMsg(''), 3000);
    } catch (err) {
      alert('Lỗi khi gửi đánh giá: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="mt-2 text-muted">Đang tải chi tiết món ăn...</p>
      </Container>
    );
  }

  if (error || !food) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h6>Lỗi!</h6>
          <p>{error || 'Không tìm thấy món ăn'}</p>
          <Button as={Link} to="/menu" variant="outline-danger" size="sm">
            Quay lại Thực đơn
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Trang chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/menu" className="text-decoration-none text-muted">Thực đơn</Link></li>
          {category && (
            <li className="breadcrumb-item">
              <Link to={`/menu?cat=${category.id}`} className="text-decoration-none text-muted">
                {category.name}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active text-danger fw-semibold" aria-current="page">
            {food.name}
          </li>
        </ol>
      </nav>

      <Row className="gy-4 mb-5">
        {/* Food Image */}
        <Col lg={6}>
          <div className="position-relative rounded overflow-hidden bg-white border">
            <img
              src={food.image}
              alt={food.name}
              className="w-100"
              style={{ maxHeight: 400, objectFit: 'cover' }}
            />
            {food.isFeatured && (
              <Badge bg="secondary" className="position-absolute top-0 end-0 m-3 p-2">
                Nổi bật
              </Badge>
            )}
          </div>
        </Col>

        {/* Food Info */}
        <Col lg={6}>
          <div className="ps-lg-3">
            <Badge bg="light" text="dark" className="mb-2 border">
              {category?.name || 'Fast Food'}
            </Badge>

            <h2 className="fw-bold mb-3 text-dark">{food.name}</h2>

            {/* Fixed Price section */}
            <div className="p-3 bg-white border rounded mb-3">
              <span className="text-muted small d-block mb-1">Giá bán:</span>
              <span className="fs-3 fw-bold text-danger">
                {food.price?.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <p className="text-secondary mb-4">{food.description}</p>

            <div className="mb-4">
              <span className="text-muted small me-2">Tình trạng:</span>
              <span className={`fw-semibold small ${food.isAvailable ? 'text-success' : 'text-danger'}`}>
                {food.isAvailable ? 'Còn món' : 'Tạm hết món'}
              </span>
            </div>

            {/* Add to Cart Actions */}
            <div className="d-flex align-items-center gap-2 pt-3 border-top">
              <div className="d-flex align-items-center border rounded px-2 py-1 bg-white">
                <Button
                  variant="link"
                  className="text-dark p-0 px-2 text-decoration-none"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!food.isAvailable}
                >
                  -
                </Button>
                <span className="px-3 fw-semibold">{quantity}</span>
                <Button
                  variant="link"
                  className="text-dark p-0 px-2 text-decoration-none"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={!food.isAvailable}
                >
                  +
                </Button>
              </div>

              <Button
                variant={added ? 'success' : 'danger'}
                className="flex-grow-1 fw-semibold"
                disabled={!food.isAvailable}
                onClick={handleAddToCart}
              >
                {added ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Reviews Section */}
      <Row className="gy-4 mb-5">
        <Col lg={7}>
          <Card className="border p-4 bg-white">
            <h5 className="fw-bold mb-3">Đánh giá từ khách hàng ({reviews.length})</h5>

            {reviews.length === 0 ? (
              <p className="text-muted small">Chưa có đánh giá nào cho món ăn này.</p>
            ) : (
              <ListGroup variant="flush">
                {reviews.map((rev) => (
                  <ListGroup.Item key={rev.id} className="px-0 py-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold text-dark small">{rev.userName}</span>
                      <Badge bg="light" text="dark" className="border">
                        {rev.rating}/5 sao
                      </Badge>
                    </div>
                    <p className="mb-1 text-secondary small">{rev.comment}</p>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                    </small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>
        </Col>

        {/* Form Write Review */}
        <Col lg={5}>
          <Card className="border p-4 bg-light">
            <h6 className="fw-bold mb-3">Gửi nhận xét của bạn</h6>

            {reviewMsg && <Alert variant="success" className="py-2 small">{reviewMsg}</Alert>}

            <Form onSubmit={handleReviewSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Đánh giá điểm số:</Form.Label>
                <Form.Select
                  size="sm"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                >
                  <option value={5}>5 sao (Rất hài lòng)</option>
                  <option value={4}>4 sao (Hài lòng)</option>
                  <option value={3}>3 sao (Bình thường)</option>
                  <option value={2}>2 sao (Chưa tốt)</option>
                  <option value={1}>1 sao (Không hài lòng)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Nội dung nhận xét:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Cảm nhận về hương vị, độ nóng, đóng gói..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="danger"
                size="sm"
                className="w-100 fw-semibold"
                disabled={submittingReview}
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Related Foods */}
      {relatedFoods.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-bold mb-3">Món ăn cùng danh mục</h5>
          <Row className="g-3">
            {relatedFoods.map((rel) => (
              <Col key={rel.id} xl={3} lg={4} md={6} sm={6}>
                <FoodCard food={rel} categoryName={category?.name} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default FoodDetail;
