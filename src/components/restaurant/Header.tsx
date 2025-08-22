import { useState } from "react";
import "./Header.css";
export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!isMenuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container">
        <div className="bar">
          {/* Logo */}
          <div className="logo">
            <h1 className="brand">Bella Vista</h1>
          </div>

          {/* Navegación escritorio */}
          <nav className="nav nav-desktop" aria-label="Navegación principal">
            {["inicio", "menu", "nosotros", "testimonios", "contacto"].map(
              (id) => (
                <a key={id} href={`#${id}`} className="nav-link">
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </a>
              )
            )}
          </nav>

          {/* CTA escritorio */}
          <div className="cta-desktop">
            <button className="btn btn-hero btn-lg">Reservar Mesa</button>
          </div>

          {/* Botón menú móvil */}
          <button
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
          >
            <span className={`icon ${isMenuOpen ? "hidden" : ""}`}>
              {/* Menu (hamburguesa) */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={`icon ${!isMenuOpen ? "hidden" : ""}`}>
              {/* Close (X) */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6l-12 12"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>
        </div>

        {/* Navegación móvil */}
        <nav
          id="mobile-nav"
          className={`nav-mobile ${isMenuOpen ? "fade-in" : ""}`}
          style={{ display: isMenuOpen ? "block" : "none" }}
        >
          <div className="nav-mobile-col">
            {["inicio", "menu", "nosotros", "testimonios", "contacto"].map(
              (id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="nav-link nav-mobile-link"
                  onClick={closeMenu}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </a>
              )
            )}
            <button className="btn btn-hero btn-lg mt-16">Reservar Mesa</button>
          </div>
        </nav>
      </div>
    </header>
  );
}
