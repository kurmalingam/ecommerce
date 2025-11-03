import './ProductDetailModal.css';

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="custom-close-btn" onClick={onClose}>
          &times;
        </button>

        <img src={product.image} alt={product.name} className="custom-modal-img" />
        <h2>{product.name}</h2>
        <p className="custom-modal-category">Category: {product.category}</p>
        <div className="custom-modal-price">
          <p>Prices:</p>
          <p>{product.price50}</p>
          {product.price100 && <p>{product.price100}</p>}
        </div>

        <p className={`custom-modal-stock ${product.stock ? 'in-stock' : 'out-of-stock'}`}>
          {product.stock ? 'In Stock' : 'Out of Stock'}
        </p>

        <div className="d-flex gap-2">
          <button
            className="custom-modal-add-btn btn btn-success flex-fill"
            disabled={!product.stock}
            onClick={() => {
              onAddToCart({ ...product, quantityType: '50g' });
              onClose();
            }}
          >
            {product.stock ? 'Add 50g' : 'Not Available'}
          </button>
          <button
            className="custom-modal-add-btn btn btn-success flex-fill"
            disabled={!product.stock || !product.price100}
            onClick={() => {
              onAddToCart({ ...product, quantityType: '100g' });
              onClose();
            }}
          >
            {product.stock && product.price100 ? 'Add 100g' : 'Not Available'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
