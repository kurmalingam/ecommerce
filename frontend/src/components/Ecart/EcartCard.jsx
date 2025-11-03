import './EcartCard.css';

const EcartCard = ({ name, category, price50, price100, stock, image, onAddToCart, onCardClick }) => {
  return (
    <div className="ecart-card" onClick={onCardClick}>
      <img src={image} alt={name} className="ecart-img" />
      <h5>{name}</h5>
      <p className="category">{category}</p>
      <div className="price-display">
        <h6>{price50}</h6>
        {price100 && <h6>{price100}</h6>}
      </div>

      <p className={stock ? "in-stock" : "out-of-stock"}>
        {stock ? "In Stock" : "Out of Stock"}
      </p>

      <button
        className="btn btn-success"
        disabled={!stock}
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click when button is clicked
          onAddToCart();
        }}
        aria-disabled={!stock}
        aria-label={stock ? `Add ${name} to cart` : `${name} out of stock`}
      >
        {stock ? "🛒 Add to Cart" : "Not Available"}
      </button>
    </div>
  );
};

export default EcartCard;
