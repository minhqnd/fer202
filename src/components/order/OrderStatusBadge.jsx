import React from 'react';
import { Badge } from 'react-bootstrap';

const OrderStatusBadge = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return <Badge bg="warning" text="dark">Chờ xác nhận</Badge>;
    case 'PREPARING':
      return <Badge bg="info" text="dark">Đang chế biến</Badge>;
    case 'DELIVERING':
      return <Badge bg="primary">Đang giao hàng</Badge>;
    case 'DELIVERED':
      return <Badge bg="success">Đã giao thành công</Badge>;
    case 'CANCELLED':
      return <Badge bg="secondary">Đã hủy</Badge>;
    default:
      return <Badge bg="light" text="dark" className="border">{status || 'Chưa rõ'}</Badge>;
  }
};

export default OrderStatusBadge;
