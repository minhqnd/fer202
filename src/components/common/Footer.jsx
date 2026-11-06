import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-4 pb-3 mt-5">
      <Container>
        <Row className="gy-3">
          <Col md={4}>
            <div className="fw-bold fs-5 mb-2 text-white">
              FASTFOOD EXPRESS
            </div>
            <p className="text-secondary small mb-2">
              Hệ thống đặt đồ ăn nhanh trực tuyến cho sinh viên và gia đình.
            </p>
          </Col>

          
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
