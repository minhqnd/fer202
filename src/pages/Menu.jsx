import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Spinner, Alert, Pagination } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import api, { endpoints } from '../config/api';
import FoodCard from '../components/food/FoodCard';
import FoodFilter from '../components/food/FoodFilter';

const ITEMS_PER_PAGE = 8;

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryParam = searchParams.get('cat') || 'all';
  const searchParam = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (searchParams.get('cat')) {
      setSelectedCategory(searchParams.get('cat'));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, foodRes] = await Promise.all([
          api.get(endpoints.categories),
          api.get(endpoints.foods),
        ]);
        setCategories(catRes.data);
        setFoods(foodRes.data);
      } catch (err) {
        setError('Lỗi khi tải thực đơn: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    if (catId === 'all') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams), cat: catId });
    }
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setSortBy('default');
    setCurrentPage(1);
    setSearchParams({});
  };

  const filteredFoods = useMemo(() => {
    let result = [...foods];

    if (selectedCategory !== 'all') {
      result = result.filter(
        (f) =>
          String(f.categoryId) === String(selectedCategory) ||
          f.categoryId === Number(selectedCategory)
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [foods, selectedCategory, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFoods.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFoods, currentPage]);

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Thực Đơn Món Ăn</h2>
        <p className="text-secondary mb-0">
          Danh sách đầy đủ các món ăn nhanh, đồ uống và combo của quán.
        </p>
      </div>

      <FoodFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleResetFilter}
      />

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Đang tải danh sách món ăn...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : filteredFoods.length === 0 ? (
        <Alert variant="warning" className="text-center py-4">
          <h6 className="fw-bold">Không tìm thấy món ăn nào phù hợp</h6>
          <p className="text-muted small mb-0">Vui lòng thử tìm kiếm với từ khóa khác.</p>
        </Alert>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted small">
              Hiển thị <strong>{filteredFoods.length}</strong> món ăn
            </span>
          </div>

          <Row className="g-3 mb-4">
            {currentItems.map((food) => {
              const cat = categories.find((c) => c.id === food.categoryId);
              return (
                <Col key={food.id} xl={3} lg={4} md={6} sm={6}>
                  <FoodCard food={food} categoryName={cat?.name} />
                </Col>
              );
            })}
          </Row>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={idx + 1 === currentPage}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default Menu;
