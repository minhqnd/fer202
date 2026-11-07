import React from 'react';
import { Card, Form, Row, Col, Button, InputGroup } from 'react-bootstrap';

const FoodFilter = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  onReset,
}) => {
  return (
    <Card className="border mb-4 p-3 bg-white">
      <Row className="g-3 align-items-center">
        {/* Search input */}
        <Col lg={4} md={6}>
          <Form.Label className="small fw-semibold text-muted mb-1">Tìm kiếm món ăn</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Nhập tên món ăn..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <Button variant="outline-secondary" onClick={() => onSearchChange('')}>
                Xóa
              </Button>
            )}
          </InputGroup>
        </Col>

        {/* Category filter */}
        <Col lg={3} md={6}>
          <Form.Label className="small fw-semibold text-muted mb-1">Danh mục món</Form.Label>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
          >
            <option value="all">Tất cả danh mục ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Sort by */}
        <Col lg={3} md={6}>
          <Form.Label className="small fw-semibold text-muted mb-1">Sắp xếp theo giá</Form.Label>
          <Form.Select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
          </Form.Select>
        </Col>

        {/* Reset */}
        <Col lg={2} md={6} className="d-flex flex-column justify-content-end">
          <Form.Label className="small fw-semibold text-muted mb-1">Thao tác</Form.Label>
          <Button variant="outline-secondary" onClick={onReset} className="w-100">
            Đặt lại bộ lọc
          </Button>
        </Col>
      </Row>

      {/* Quick category buttons */}
      <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
        <Button
          size="sm"
          variant={selectedCategory === 'all' ? 'danger' : 'outline-secondary'}
          onClick={() => onSelectCategory('all')}
        >
          Tất cả
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={String(selectedCategory) === String(cat.id) ? 'danger' : 'outline-secondary'}
            onClick={() => onSelectCategory(String(cat.id))}
          >
            {cat.name}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default FoodFilter;
