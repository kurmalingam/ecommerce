import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Ecart.css";
import EcartCard from "../components/Ecart/EcartCard";
import ProductDetailModal from "../components/Ecart/ProductDetailModal";
import products from "../components/Ecart/EcartData";

const Ecart = ({ isLoggedIn, handleLogout }) => {
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPrice = (totalWeight, price50Str, price100Str) => {
    const p50 = parseInt(price50Str.match(/₹(\d+)/)[1]);
    const p100 = price100Str ? parseInt(price100Str.match(/₹(\d+)/)[1]) : p50 * 2;
    let price = 0;
    let remaining = totalWeight;
    while (remaining > 0) {
      if (remaining >= 100) {
        price += p100;
        remaining -= 100;
      } else if (remaining >= 50) {
        price += p50;
        remaining -= 50;
      } else {
        price += p50;
        remaining = 0;
      }
    }
    return price;
  };

  // Debounce search term
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load cart items from localStorage on component mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error('Error loading cart from localStorage:', err);
      setError('Failed to load cart items. Please refresh the page.');
    }
  }, []);



  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return ["All", ...uniqueCategories];
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (item) =>
        item.name.toLowerCase().replace(/\s/g, '').includes(debouncedSearchTerm.toLowerCase().replace(/\s/g, '')) &&
        (!showInStockOnly || item.stock) &&
        (selectedCategory === "All" || item.category === selectedCategory)
    );
  }, [debouncedSearchTerm, showInStockOnly, selectedCategory]);

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    setCartItems((prev) => {
      const quantityType = product.quantityType || '50g';
      const cartKey = `${product.name}-${quantityType}`;

      const existing = prev.find((item) => item.cartKey === cartKey);
      let newCart;
      if (existing) {
        const newCount = existing.count + 1;
        const totalWeight = parseInt(quantityType) * newCount;
        const newPrice = getPrice(totalWeight, existing.price50, existing.price100);
        newCart = prev.map((item) =>
          item.cartKey === cartKey ? { ...item, count: newCount, price: newPrice } : item
        );
      } else {
        const totalWeight = parseInt(quantityType);
        const price = getPrice(totalWeight, product.price50, product.price100);
        newCart = [...prev, {
          ...product,
          cartKey,
          quantityType,
          price,
          count: 1
        }];
      }
      try {
        localStorage.setItem('cartItems', JSON.stringify(newCart));
      } catch (err) {
        console.error('Error saving cart to localStorage:', err);
        setError('Failed to save cart items. Please try again.');
      }
      return newCart;
    });
    // Trigger cart animation
    const cartBtn = document.querySelector('.btn-ecart');
    if (cartBtn) {
      cartBtn.style.transform = 'scale(1.1)';
      setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
      }, 200);
    }
  };

  const handleRemoveFromCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartKey === product.cartKey);
      let newCart;
      if (existing.count === 1) {
        newCart = prev.filter((item) => item.cartKey !== product.cartKey);
      } else {
        const newCount = existing.count - 1;
        const totalWeight = parseInt(existing.quantityType) * newCount;
        const newPrice = getPrice(totalWeight, existing.price50, existing.price100);
        newCart = prev.map((item) =>
          item.cartKey === product.cartKey ? { ...item, count: newCount, price: newPrice } : item
        );
      }
      try {
        localStorage.setItem('cartItems', JSON.stringify(newCart));
      } catch (err) {
        console.error('Error saving cart to localStorage:', err);
        setError('Failed to save cart items. Please try again.');
      }
      return newCart;
    });
  };

  const handleDeleteFromCart = (product) => {
    setCartItems((prev) => {
      const newCart = prev.filter((item) => item.cartKey !== product.cartKey);
      try {
        localStorage.setItem('cartItems', JSON.stringify(newCart));
      } catch (err) {
        console.error('Error saving cart to localStorage:', err);
        setError('Failed to save cart items. Please try again.');
      }
      return newCart;
    });
  };

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    const phoneNumber = "1234567890"; // Replace with your WhatsApp number
    let message = "Hello! I want to order:\n";

    cartItems.forEach((item) => {
      message += `- ${item.name} = ₹${item.price} (Total weight: ${parseInt(item.quantityType) * item.count}g)\n`;
    });

    const total = cartItems.reduce(
      (acc, item) => acc + item.price,
      0
    );
    message += `Total: ₹${total}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const handleCardClick = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCartClick = () => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    setCartOpen(true);
  };

  return (
    <div className="ecart-full-body">
      <nav className="navbar navbar-expand-lg fixed-top navbar-dark main-navbar" id="main-navbar">
        <div className="container-fluid">
          <Link to="" className="navbar-brand d-flex align-items-center">
            <img
              src="/images/Logo.jpg"
              alt="Dry Pandas Logo"
              className="logo-img img-fluid"
            />
            <h4 className="m-0 brand-text">Drypanda Foods-Ecart</h4>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav mx-auto gap-lg-3 align-items-center">
              {/* Category dropdown */}
              <li className="nav-item">
                <select
                  className="form-select form-select-sm"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setIsTransitioning(false);
                    }, 150);
                  }}
                  aria-label="Select product category"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </li>

              {/* Stock Filter */}
              <li className="nav-item">
                <div className="form-check form-switch stock-filter-navbar">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="stockFilter"
                    checked={showInStockOnly}
                    onChange={(e) => setShowInStockOnly(e.target.checked)}
                  />
                  <label className="form-check-label text-white" htmlFor="stockFilter">
                    In Stock Only
                  </label>
                </div>
              </li>

              <li className="nav-item">
                <div className="nav-item search-box">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="form-control"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search for products"
                  />
                  <span className="search-icon" aria-hidden="true">🔍</span>
                  {searchTerm && (
                    <button
                      className="btn btn-sm btn-outline-secondary clear-search"
                      onClick={() => setSearchTerm("")}
                      title="Clear search"
                      aria-label="Clear search input"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </li>
            </ul>

            <div className="login-wrapper d-flex gap-4">
              {isLoggedIn && (
                <button
                  className="btn btn-ecart px-3"
                  onClick={handleCartClick}
                  aria-label={`Open cart with ${cartItems.reduce((acc, item) => acc + item.count, 0)} items`}
                >
                  <i className="bi bi-cart4 me-2" aria-hidden="true"></i>
                  E-Cart ({cartItems.reduce((acc, item) => acc + item.count, 0)})
                </button>
              )}

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light px-3"
                  aria-label="Logout"
                >
                  <i className="bi bi-person-fill me-2" aria-hidden="true"></i>Logout
                </button>
              ) : (
                <Link to="/auth" className="btn btn-outline-light px-3" aria-label="Login">
                  <i className="bi bi-person-fill me-2" aria-hidden="true"></i>Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>



      <div className={`ecart-body flex-grow-1 ${isTransitioning ? 'transitioning' : ''}`}>
        {error ? (
          <div className="text-center w-100" style={{ marginTop: "2rem" }}>
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center w-100" style={{ marginTop: "2rem" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: "brown", marginTop: "1rem" }}>Searching products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((item, index) => (
            <EcartCard
              key={index}
              name={item.name}
              category={item.category}
              price50={item.price50}
              price100={item.price100}
              stock={item.stock}
              image={item.image}
              onAddToCart={() => handleAddToCart(item)}
              onCardClick={() => handleCardClick(item)}
            />
          ))
        ) : (
          <p
            className="text-center w-100"
            style={{ color: "brown", marginTop: "2rem" }}
          >
            No products found.
          </p>
        )}
      </div>

      <footer className="text-white text-center py-3 mt-auto">
        <div className="small">
          &copy; 2025 <strong>Dry Panda Foods</strong>. All rights reserved.
        </div>
      </footer>

      {/* Cart Drawer */}
      <div className={`cart-overlay ${cartOpen ? "show" : ""}`} role="dialog" aria-labelledby="cart-title" aria-modal="true">
        <div className="cart-panel">
          <div className="cart-header d-flex justify-content-between align-items-center">
            <h5 id="cart-title">Your Cart</h5>
            <button
              className="btn-close"
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
            ></button>
          </div>
          <div className="cart-body">
            {cartItems.length === 0 ? (
              <p>Oops! No items in cart.</p>
            ) : (
              <ul className="list-unstyled" role="list">
                {cartItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="d-flex justify-content-between align-items-center mb-3 cart-item"
                    role="listitem"
                  >
                    <div>
                      <strong>{item.name}</strong> - ₹{item.price}
                      <br />
                      <small className="text-muted">Total weight: {parseInt(item.quantityType) * item.count}g</small>
                    </div>
                    <div className="d-flex align-items-center gap-2" role="group" aria-label={`Actions for ${item.name}`}>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveFromCart(item)}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <span aria-label={`Quantity: ${item.count}`}>{item.count}</span>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleAddToCart(item)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => handleDeleteFromCart(item)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        🗑
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {cartItems.length > 0 && (
              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleWhatsAppCheckout}
                aria-label="Checkout via WhatsApp"
              >
                Checkout via WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      />
    </div>
  );
};

export default Ecart;
