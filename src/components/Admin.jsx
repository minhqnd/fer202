import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Form,
  Modal,
  Alert,
  Image,
  Badge,
  InputGroup,
} from "react-bootstrap";
import {
  getFoods,
  getCategories,
  createFood,
  updateFood,
  deleteFood,
} from "../config/api";

const initialFood = {
  name: "",
  categoryId: "",
  price: "",
  originalPrice: "",
  rating: 5,
  calories: "",
  preparationTime: "",
  isAvailable: true,
  isFeatured: false,
  image: "",
  description: "",
  ingredients: "",
};

function Admin() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialFood);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    try {
      const [foodResponse, categoryResponse] = await Promise.all([
        getFoods(),
        getCategories(),
      ]);

      setFoods(foodResponse.data);
      setCategories(categoryResponse.data);
      setError("");
    } catch (error) {
      setError("Không thể tải dữ liệu. Hãy kiểm tra JSON Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null",
    );

    if (!currentUser || currentUser.role !== "admin") {
      setError("Bạn cần đăng nhập bằng tài khoản quản trị viên.");
      setLoading(false);
      return;
    }

    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...initialFood,
      categoryId: categories[0]?.id || "",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (food) => {
    setEditingId(food.id);
    setForm({
      ...initialFood,
      ...food,
      price: String(food.price ?? ""),
      originalPrice: String(food.originalPrice ?? ""),
      calories: String(food.calories ?? ""),
      preparationTime: String(food.preparationTime ?? ""),
      ingredients: Array.isArray(food.ingredients)
        ? food.ingredients.join(", ")
        : food.ingredients || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const price = Number(form.price);
    const originalPrice =
      form.originalPrice === "" ? price : Number(form.originalPrice);

    if (price <= 0 || !Number.isFinite(price)) {
      setError("Giá món ăn phải lớn hơn 0.");
      return;
    }

    if (originalPrice < price || !Number.isFinite(originalPrice)) {
      setError("Giá gốc phải lớn hơn hoặc bằng giá bán.");
      return;
    }

    const foodData = {
      ...form,
      categoryId: String(form.categoryId),
      price,
      originalPrice,
      rating: Number(form.rating),
      calories: Number(form.calories || 0),
      preparationTime: Number(form.preparationTime || 0),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingId !== null) {
        await updateFood(editingId, foodData);
        setMessage("Cập nhật món ăn thành công.");
      } else {
        await createFood(foodData);
        setMessage("Thêm món ăn thành công.");
      }

      setShowModal(false);
      await loadData();
    } catch (error) {
      setError("Không thể lưu món ăn. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (food) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa món "${food.name}" không?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteFood(food.id);
      setMessage("Xóa món ăn thành công.");
      await loadData();
    } catch (error) {
      setError("Xóa món ăn thất bại.");
    }
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2>Quản lý món ăn</h2>
          <p className="text-muted mb-0">Thêm, cập nhật và quản lý thực đơn.</p>
        </div>

        <Button variant="warning" onClick={openAddModal}>
          + Thêm món ăn
        </Button>
      </div>

      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <InputGroup className="mb-3">
        <InputGroup.Text>Tìm món</InputGroup.Text>
        <Form.Control
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nhập tên món ăn..."
        />
      </InputGroup>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <Table responsive bordered hover>
          <thead className="table-light">
            <tr>
              <th>Ảnh</th>
              <th>Tên món</th>
              <th>Danh mục</th>
              <th>Giá bán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {filteredFoods.map((food) => {
              const category = categories.find(
                (item) => String(item.id) === String(food.categoryId),
              );

              return (
                <tr key={food.id}>
                  <td>
                    <Image
                      src={food.image}
                      alt={food.name}
                      width={65}
                      height={50}
                      rounded
                      style={{ objectFit: "cover" }}
                    />
                  </td>

                  <td>{food.name}</td>
                  <td>{category?.name || "Chưa phân loại"}</td>
                  <td>{Number(food.price).toLocaleString("vi-VN")} đ</td>

                  <td>
                    <Badge bg={food.isAvailable ? "success" : "secondary"}>
                      {food.isAvailable ? "Đang bán" : "Ngừng bán"}
                    </Badge>
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => openEditModal(food)}
                      >
                        Sửa
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(food)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredFoods.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Không tìm thấy món ăn.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingId !== null ? "Cập nhật món ăn" : "Thêm món ăn"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Tên món ăn</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Giá bán (VNĐ)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </Form.Group>

              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Giá gốc (VNĐ)</Form.Label>
                <Form.Control
                  type="number"
                  name="originalPrice"
                  value={form.originalPrice}
                  onChange={handleChange}
                  min="1"
                />
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="col-md-4 mb-3">
                <Form.Label>Đánh giá</Form.Label>
                <Form.Control
                  type="number"
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  required
                />
              </Form.Group>

              <Form.Group className="col-md-4 mb-3">
                <Form.Label>Calories</Form.Label>
                <Form.Control
                  type="number"
                  name="calories"
                  value={form.calories}
                  onChange={handleChange}
                  min="0"
                />
              </Form.Group>

              <Form.Group className="col-md-4 mb-3">
                <Form.Label>Thời gian (phút)</Form.Label>
                <Form.Control
                  type="number"
                  name="preparationTime"
                  value={form.preparationTime}
                  onChange={handleChange}
                  min="0"
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>URL hình ảnh</Form.Label>
              <Form.Control
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nguyên liệu</Form.Label>
              <Form.Control
                name="ingredients"
                value={form.ingredients}
                onChange={handleChange}
                placeholder="Gà, phô mai, rau..."
              />
              <Form.Text className="text-muted">
                Phân cách các nguyên liệu bằng dấu phẩy.
              </Form.Text>
            </Form.Group>

            <Form.Check
              className="mb-2"
              type="checkbox"
              name="isAvailable"
              label="Đang bán"
              checked={form.isAvailable}
              onChange={handleChange}
            />

            <Form.Check
              type="checkbox"
              name="isFeatured"
              label="Món nổi bật"
              checked={form.isFeatured}
              onChange={handleChange}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>

            <Button type="submit" variant="warning">
              {editingId !== null ? "Lưu thay đổi" : "Thêm món"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Admin;
