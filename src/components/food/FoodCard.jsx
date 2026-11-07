import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const FoodCard = ({ food, categoryName }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(food, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Card className="food-card h-100 position-relative">
      <Link to={`/foods/${food.id}`} className="text-decoration-none text-dark">
        <div className="food-card-img-wrapper position-relative">
          <img src={food.image} alt={food.name} loading="lazy" />

          {food.isFeatured && (
            <Badge
              bg="secondary"
              className="position-absolute top-0 end-0 m-2 px-2 py-1"
            >
              Nổi bật
            </Badge>
          )}

          {!food.isAvailable && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 text-white fw-semibold small">
              Tạm hết món
            </div>
          )}
        </div>

        <Card.Body className="d-flex flex-column p-3">
          <div className="mb-1">
            <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>
              {categoryName || 'Fast Food'}
            </small>
          </div>

          <Card.Title className="fs-6 fw-bold mb-1 text-truncate" title={food.name}>
            {food.name}
          </Card.Title>

          <p
            className="text-secondary small mb-3"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.5rem',
              lineHeight: 1.25,
            }}
          >
            {food.description}
          </p>

          <div className="mt-auto d-flex align-items-center justify-content-between pt-2 border-top">
            <div className="fw-bold text-danger fs-6">
              {food.price?.toLocaleString('vi-VN')}đ
            </div>

            <Button
              variant={added ? 'success' : 'outline-danger'}
              size="sm"
              disabled={!food.isAvailable}
              onClick={handleAddToCart}
            >
              {added ? 'Đã thêm' : 'Thêm vào giỏ'}
            </Button>
          </div>
        </Card.Body>
      </Link>
    </Card>
  );
};

export default FoodCard;
