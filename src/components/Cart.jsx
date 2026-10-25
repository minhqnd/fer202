import { useEffect, useState } from "react";
import { Container, Table, Button, Image, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      return;
    }

    const updatedCart = cart.map((item) =>
      String(item.id) === String(id) ? { ...item, quantity } : item,
    );

    saveCart(updatedCart);
  };

  const removeFood = (id) => {
    const updatedCart = cart.filter((item) => String(item.id) !== String(id));

    saveCart(updatedCart);
  };

  const totalAmount = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + "đ";

  return (
    <Container className="py-4">
      <h2 className="mb-4">Giỏ hàng của tôi</h2>

      {cart.length === 0 ? (
        <Alert variant="info">
          Giỏ hàng đang trống.
          <div className="mt-3">
            <Button as={Link} to="/foods" variant="warning">
              Tiếp tục mua hàng
            </Button>
          </div>
        </Alert>
      ) : (
        <>
          <Table responsive bordered hover>
            <thead>
              <tr>
                <th>Món ăn</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                      rounded
                      className="me-2"
                    />
                    {item.name}
                  </td>

                  <td>{formatPrice(item.price)}</td>

                  <td>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>

                    <span className="mx-3">{item.quantity}</span>

                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= 99}
                    >
                      +
                    </Button>
                  </td>

                  <td>{formatPrice(Number(item.price) * item.quantity)}</td>

                  <td>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => removeFood(item.id)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="text-end">
            <h4>
              Tổng tiền:{" "}
              <span className="text-danger">{formatPrice(totalAmount)}</span>
            </h4>

            <Button
              variant="outline-danger"
              className="me-2"
              onClick={() => saveCart([])}
            >
              Xóa toàn bộ
            </Button>

            <Button as={Link} to="/foods" variant="secondary" className="me-2">
              Mua thêm
            </Button>

            <Button as={Link} to="/checkout" variant="warning">
              Thanh toán
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}

export default Cart;
