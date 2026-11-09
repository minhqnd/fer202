import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const endpoints = {
  categories: '/categories',
  foods: '/foods',
  users: '/users',
  orders: '/orders',
  reviews: '/reviews',
};

export default api;
