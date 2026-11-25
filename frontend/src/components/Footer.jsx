import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-logo">Green Express</p>
          <p>New York, USA · London, UK · Tokyo, Japan</p>
          <p>+821010022323 | greenexpress@example.com</p>
        </div>
        <div className="footer-links">
          <Link to="/track">Track a parcel</Link>
          <Link to="/prices">Prices</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
      <p className="container footer-note">Built with React, Express, Node.js and MySQL.</p>
    </footer>
  );
}

export default Footer;
