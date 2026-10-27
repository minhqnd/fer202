import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Navbar,
  Modal,
  ButtonGroup,
} from 'react-bootstrap';
import api from './config/api';
import { initialData } from './data/initialData';

function App() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'table'

  // Modal xem chi tiết
  const [selectedFood, setSelectedFood] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resFoods, resCats] = await Promise.all([
          api.get('/foods'),
          api.get('/categories'),
        ]);
        setFoods(resFoods.data);
        setCategories(resCats.data);
      } catch (err) {
        console.warn('Không thể kết nối json-server, sử dụng dữ liệu cục bộ:', err.message);
        setFoods(initialData.foods || []);
        setCategories(initialData.categories || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lấy tên danh mục theo id
  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => Number(c.id) === Number(categoryId));
    return cat ? cat.name : 'Khác';
  };

  // Định dạng giá tiền VNĐ
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Xử lý Lọc & Tìm kiếm & Sắp xếp
  const filteredFoods = foods
    .filter((food) => {
      // Tìm theo tên
      const matchSearch = food.name
        .toLowerCase()
        .includes(searchText.toLowerCase().trim());

      // Lọc theo danh mục
      const matchCategory =
        selectedCategory === 'all' ||
        Number(food.categoryId) === Number(selectedCategory);

      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return a.id - b.id;
    });

  // Đặt lại bộ lọc
  const handleReset = () => {
    setSearchText('');
    setSelectedCategory('all');
    setSortOrder('default');
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar thuần Bootstrap */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home" className="fw-bold">
            🍔 Fast Food Store
          </Navbar.Brand>
          <Navbar.Text className="text-white-50">
            FER202 - Quản lý món ăn
          </Navbar.Text>
        </Container>
      </Navbar>

      <Container className="pb-5">
        {/* Tiêu đề & Nút đổi chế độ xem */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0 fw-bold">Danh sách món ăn</h3>
          <ButtonGroup size="sm">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('grid')}
            >
              Dạng lưới
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('table')}
            >
              Dạng bảng
            </Button>
          </ButtonGroup>
        </div>

        {/* Thanh tìm kiếm và bộ lọc (Card thuần Bootstrap) */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="g-3 align-items-end">
              {/* Tìm kiếm tên */}
              <Col md={4}>
                <Form.Group controlId="searchFood">
                  <Form.Label className="fw-semibold">Tìm theo tên món:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên món ăn cần tìm..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Form.Group>
              </Col>

              {/* Lọc danh mục */}
              <Col md={3}>
                <Form.Group controlId="filterCategory">
                  <Form.Label className="fw-semibold">Danh mục:</Form.Label>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Sắp xếp giá */}
              <Col md={3}>
                <Form.Group controlId="sortPrice">
                  <Form.Label className="fw-semibold">Sắp xếp theo giá:</Form.Label>
                  <Form.Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="default">Mặc định</option>
                    <option value="asc">Giá: Thấp đến Cao</option>
                    <option value="desc">Giá: Cao đến Thấp</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Nút đặt lại */}
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={handleReset}
                >
                  Đặt lại lọc
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Thống kê số lượng */}
        <div className="mb-3 text-muted">
          Tìm thấy <strong>{filteredFoods.length}</strong> món ăn
        </div>

        {/* Trạng thái tải dữ liệu */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
          </div>
        ) : filteredFoods.length === 0 ? (
          /* Trạng thái không có kết quả */
          <Card className="text-center py-5 shadow-sm">
            <Card.Body>
              <h5 className="text-muted">Không tìm thấy món ăn nào phù hợp</h5>
              <Button variant="primary" size="sm" className="mt-2" onClick={handleReset}>
                Xóa bộ lọc
              </Button>
            </Card.Body>
          </Card>
        ) : viewMode === 'grid' ? (
          /* 1. Hiển thị dạng lưới (Grid Card) */
          <Row className="g-4">
            {filteredFoods.map((food) => (
              <Col key={food.id} sm={6} md={4} lg={3}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Img
                    variant="top"
                    src={food.image}
                    alt={food.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg="info" text="dark">
                        {getCategoryName(food.categoryId)}
                      </Badge>
                      <small className="text-warning fw-bold">
                        ⭐ {food.rating || 5}
                      </small>
                    </div>

                    <Card.Title className="fs-6 fw-bold mb-1 text-truncate" title={food.name}>
                      {food.name}
                    </Card.Title>

                    <Card.Text
                      className="text-muted small mb-3 flex-grow-1"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {food.description}
                    </Card.Text>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <span className="fw-bold text-danger fs-6">
                        {formatPrice(food.price)}
                      </span>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setSelectedFood(food)}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          /* 2. Hiển thị dạng bảng (Table) */
          <Card className="shadow-sm border-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>#ID</th>
                  <th>Hình ảnh</th>
                  <th>Tên món ăn</th>
                  <th>Danh mục</th>
                  <th>Đơn giá</th>
                  <th>Đánh giá</th>
                  <th>Trạng thái</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredFoods.map((food) => (
                  <tr key={food.id}>
                    <td>#{food.id}</td>
                    <td>
                      <img
                        src={food.image}
                        alt={food.name}
                        style={{
                          width: '60px',
                          height: '45px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                      />
                    </td>
                    <td>
                      <div className="fw-semibold">{food.name}</div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '250px' }}>
                        {food.description}
                      </small>
                    </td>
                    <td>
                      <Badge bg="secondary">
                        {getCategoryName(food.categoryId)}
                      </Badge>
                    </td>
                    <td className="fw-bold text-danger">
                      {formatPrice(food.price)}
                    </td>
                    <td>⭐ {food.rating || 5}</td>
                    <td>
                      {food.isAvailable ? (
                        <Badge bg="success">Còn hàng</Badge>
                      ) : (
                        <Badge bg="secondary">Hết hàng</Badge>
                      )}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => setSelectedFood(food)}
                      >
                        Xem
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        {/* Modal xem chi tiết món ăn (thuần Bootstrap Modal) */}
        <Modal show={Boolean(selectedFood)} onHide={() => setSelectedFood(null)} centered>
          {selectedFood && (
            <>
              <Modal.Header closeButton>
                <Modal.Title className="fs-5">{selectedFood.name}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <img
                  src={selectedFood.image}
                  alt={selectedFood.name}
                  className="w-100 rounded mb-3"
                  style={{ height: '220px', objectFit: 'cover' }}
                />
                <div className="d-flex justify-content-between mb-2">
                  <Badge bg="primary">{getCategoryName(selectedFood.categoryId)}</Badge>
                  <span className="fw-bold text-danger fs-5">
                    {formatPrice(selectedFood.price)}
                  </span>
                </div>
                <p className="text-muted">{selectedFood.description}</p>
                <ul className="list-unstyled small text-muted border-top pt-2">
                  <li><strong>Thời gian làm:</strong> {selectedFood.preparationTime || '10-15 phút'}</li>
                  <li><strong>Năng lượng:</strong> {selectedFood.calories || 500} kcal</li>
                  <li><strong>Đánh giá:</strong> ⭐ {selectedFood.rating || 5}/5</li>
                  <li>
                    <strong>Trạng thái:</strong>{' '}
                    {selectedFood.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                  </li>
                </ul>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setSelectedFood(null)}>
                  Đóng
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal>
      </Container>
    </div>
  );
}

export default App;