import axios from "axios";

const API_URL = "http://localhost:9999";

const api = axios.create({
  baseURL: API_URL,
});

// Categories
export const getCategories = () => api.get("/categories");
export const getCategoryById = (id) => api.get(`/categories/${id}`);
export const createCategory = (category) => api.post("/categories", category);
export const updateCategory = (id, category) =>
  api.put(`/categories/${id}`, category);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Foods
export const getFoods = () => api.get("/foods");
export const getFoodById = (id) => api.get(`/foods/${id}`);
export const createFood = (food) => api.post("/foods", food);
export const updateFood = (id, food) => api.put(`/foods/${id}`, food);
export const deleteFood = (id) => api.delete(`/foods/${id}`);

// Users
export const getUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (user) => api.post("/users", user);
export const updateUser = (id, user) => api.put(`/users/${id}`, user);

// Orders
export const getOrders = () => api.get("/orders");
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (order) => api.post("/orders", order);
export const updateOrder = (id, order) => api.patch(`/orders/${id}`, order);

// Reviews
export const getReviews = () => api.get("/reviews");
export const getReviewsByFoodId = (foodId) =>
  api.get(`/reviews?foodId=${foodId}`);
export const createReview = (review) => api.post("/reviews", review);

// Vouchers
export const getVouchers = () => api.get("/vouchers");
export const getVoucherByCode = (code) =>
  api.get(`/vouchers?code=${encodeURIComponent(code)}`);

export default api;
