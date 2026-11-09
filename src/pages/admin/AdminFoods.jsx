import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Modal,
  Badge,
  Spinner,
  Alert,
} from 'react-bootstrap';
import api, { endpoints } from '../../config/api';

const defaultFoodForm = {
  name: '',
  categoryId: 1,
  price: '',
  isAvailable: true,
  isFeatured: false,
  image: '',
  description: '',
};

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [currentFoodId, setCurrentFoodId] = useState(null);
  const [formData, setFormData] = useState(defaultFoodForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fRes, cRes] = await Promise.all([
        api.get(endpoints.foods),
        api.get(endpoints.categories),
      ]);
      setFoods(fRes.data);
      setCategories(cRes.data);
    } catch (err) {
      setError('Lỗi khi tải danh sách món: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFoods = foods.filter((f) => {
    const matchCat =
      selectedCat === 'all' || String(f.categoryId) === String(selectedCat);
    const matchSearch =
      !searchTerm.trim() ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    return matchCat && matchSearch;
  });

  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setCurrentFoodId(null);
    setFormData({
      ...defaultFoodForm,
      categoryId: categories[0]?.id || 1,
      image:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (food) => {
    setModalMode('EDIT');
    setCurrentFoodId(food.id);
    setFormData({
      name: food.name,
      categoryId: food.categoryId,
      price: food.price,
      isAvailable: food.isAvailable !== false,
      isFeatured: !!food.isFeatured,
      image: food.image,
      description: food.description || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Vui lòng nhập tên món ăn';
    if (!formData.price || Number(formData.price) <= 0)
      errs.price = 'Giá món phải lớn hơn 0';
    if (!formData.image.trim()) errs.image = 'Vui lòng cung cấp link ảnh món';
    if (!formData.description.trim()) errs.description = 'Vui lòng nhập mô tả món ăn';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        categoryId: Number(formData.categoryId),
        price: Number(formData.price),
        isAvailable: Boolean(formData.isAvailable),
        isFeatured: Boolean(formData.isFeatured),
        image: formData.image.trim(),
        description: formData.description.trim(),
      };

      if (modalMode === 'CREATE') {
        const res = await api.post(endpoints.foods, payload);
        setFoods((prev) => [res.data, ...prev]);
      } else {
        const res = await api.put(`${endpoints.foods}/${currentFoodId}`, payload);
        setFoods((prev) =>
          prev.map((f) => (f.id === currentFoodId ? res.data : f))
        );
      }

      setShowModal(false);
    } catch (err) {
      alert('Lưu món ăn thất bại: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailable = async (food) => {
    try {
      const updated = !food.isAvailable;
      await api.patch(`${endpoints.foods}/${food.id}`, { isAvailable: updated });
      setFoods((prev) =>
        prev.map((f) => (f.id === food.id ? { ...f, isAvailable: updated } : f))
      );
    } catch (err) {
      alert('Không thể đổi trạng thái: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!foodToDelete) return;
    try {
      await api.delete(`${endpoints.foods}/${foodToDelete.id}`);
      setFoods((prev) => prev.filter((f) => f.id !== foodToDelete.id));
      setShowDeleteModal(false);
      setFoodToDelete(null);
    } catch (err) {
      alert('Lỗi xóa món ăn: ' + err.message);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Quản Lý Món Ăn</h3>
          <p className="text-secondary small mb-0">Thêm mới, sửa thông tin và cập nhật giá bán cố định của món.</p>
        </div>
        <Button variant="danger" size="sm" onClick={handleOpenCreate}>
          Thêm món mới
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border p-3 mb-4 bg-white">
        <Row className="g-3">
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm món ăn theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>

          <Col md={4}>
            <Form.Select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : (
        <Card className="border p-3 bg-white">
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Ảnh</th>
                <th>Tên món ăn</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Trạng thái</th>
                <th>Nổi bật</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredFoods.map((food) => {
                const cat = categories.find((c) => c.id === food.categoryId);
                return (
                  <tr key={food.id}>
                    <td>
                      <img
                        src={food.image}
                        alt={food.name}
                        style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div className="fw-semibold small">{food.name}</div>
                      <small className="text-muted d-block text-truncate" style={{ maxWidth: 220 }}>
                        {food.description}
                      </small>
                    </td>
                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {cat?.name || 'Chưa phân loại'}
                      </Badge>
                    </td>
                    <td>
                      <div className="fw-semibold text-danger small">
                        {food.price?.toLocaleString('vi-VN')}đ
                      </div>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={food.isAvailable ? 'outline-success' : 'outline-secondary'}
                        onClick={() => handleToggleAvailable(food)}
                      >
                        {food.isAvailable ? 'Còn món' : 'Hết món'}
                      </Button>
                    </td>
                    <td>
                      {food.isFeatured ? (
                        <Badge bg="secondary">Nổi bật</Badge>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenEdit(food)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setFoodToDelete(food);
                          setShowDeleteModal(true);
                        }}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Modal Add / Edit Food */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Form onSubmit={handleSaveFood}>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-6">
              {modalMode === 'CREATE' ? 'Thêm món ăn mới' : 'Chỉnh sửa món ăn'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Tên món ăn</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Danh mục món</Form.Label>
                  <Form.Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Giá bán cố định (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.price}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.price}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Link ảnh món (URL)</Form.Label>
                  <Form.Control
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.image}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.image}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">Mô tả món ăn</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.description}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.description}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  id="check-available"
                  name="isAvailable"
                  label="Còn hàng và sẵn sàng phục vụ"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                />
              </Col>

              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  id="check-featured"
                  name="isFeatured"
                  label="Đặt làm món Nổi Bật"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" size="sm" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu món ăn'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-6 text-danger">Xác nhận xóa món</Modal.Title>
        </Modal.Header>
        <Modal.Body className="small">
          Bạn có chắc chắn muốn xóa món <strong>{foodToDelete?.name}</strong> khỏi thực đơn không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
            Không
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
            Đồng ý xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminFoods;
