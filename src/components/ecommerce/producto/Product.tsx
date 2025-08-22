import { useState, useEffect } from "react";
import "./Product.css";
interface Product {
  image: string;
  name: string;
  category: string;
  bestseller: boolean;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  description: string;
  colors: string[];
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [mainImage, setMainImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    // Esto reemplaza tus scripts de DOM
  }, []);

  const handleAddToCart = () => {
    console.log(
      `Agregado al carrito: cantidad ${quantity}, color ${selectedColor}`
    );
    alert("¡Producto agregado al carrito!");
  };

  const handleWishlist = () => {
    setWishlist(!wishlist);
    alert(wishlist ? "¡Removido de favoritos!" : "¡Agregado a favoritos!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("¡URL copiada al portapapeles!");
    }
  };

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail__grid">
          {/* Galería */}
          <div className="product-detail__gallery">
            <div className="main-image">
              <img src={mainImage} alt={product.name} />
            </div>
            <div className="thumbnail-images">
              {[
                product.image,
                product.image.replace("?w=400", "?w=400&sat=-100"),
                product.image.replace("?w=400", "?w=400&sepia=100"),
                product.image.replace("?w=400", "?w=400&blur=2"),
              ].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} - Vista ${i + 1}`}
                  className={
                    img === mainImage ? "thumbnail active" : "thumbnail"
                  }
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-detail__info">
            <div className="product-breadcrumb">
              <a href="/">Inicio</a> / <a href="/shop">Tienda</a> /{" "}
              <span>{product.category}</span>
            </div>

            {product.bestseller && (
              <div className="bestseller-badge">🏆 Más Vendido</div>
            )}

            <h1 className="product-title">{product.name}</h1>

            <div className="product-rating">
              <div className="stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`star ${
                      i < Math.floor(product.rating) ? "filled" : ""
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">
                ({product.rating}) • {product.reviews} reseñas
              </span>
            </div>

            <div className="product-price">
              <span className="current-price">${product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="original-price">
                    ${product.originalPrice}
                  </span>
                  <span className="discount">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    % OFF
                  </span>
                </>
              )}
            </div>

            <p className="product-description">{product.description}</p>

            {/* Colores */}
            <div className="color-selector">
              <h3>Colores disponibles:</h3>
              <div className="color-options">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    className={`color-option ${
                      selectedColor === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Cantidad */}
            <div className="quantity-selector">
              <h3>Cantidad:</h3>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.min(10, Number(e.target.value)))
                    )
                  }
                />
                <button onClick={() => setQuantity(Math.min(10, quantity + 1))}>
                  +
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="product-actions">
              <button onClick={handleAddToCart} className="btn btn-primary">
                🛒 Agregar al Carrito
              </button>
              <button onClick={handleWishlist} className="btn btn-secondary">
                {wishlist ? "♥" : "♡"}
              </button>
              <button onClick={handleShare} className="btn btn-secondary">
                📤
              </button>
            </div>

            {/* Características */}
            <div className="product-features">
              <div className="feature">
                <span>🚚</span>
                <div>
                  <strong>Envío gratis</strong>
                  <p>En compras mayores a $50</p>
                </div>
              </div>
              <div className="feature">
                <span>↩️</span>
                <div>
                  <strong>Devolución fácil</strong>
                  <p>30 días para cambios</p>
                </div>
              </div>
              <div className="feature">
                <span>✨</span>
                <div>
                  <strong>Producto original</strong>
                  <p>100% auténtico</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="tab-buttons">
            {["description", "ingredients", "reviews", "shipping"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab[0].toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>
          <div className="tab-content">
            {activeTab === "description" && (
              <div className="tab-panel active">
                <h3>Descripción del producto</h3>
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === "ingredients" && (
              <div className="tab-panel active">
                <h3>Ingredientes principales</h3>
                <p>
                  Aqua, Cyclopentasiloxane, Dimethicone, Glycerin, Titanium
                  Dioxide, Iron Oxides, Phenoxyethanol, Ethylhexylglycerin.
                </p>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="tab-panel active">
                <h3>Reseñas de clientes</h3>
                {/* Puedes mapear reviews aquí */}
              </div>
            )}
            {activeTab === "shipping" && (
              <div className="tab-panel active">
                <h3>Información de envío</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
