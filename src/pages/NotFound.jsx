import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="notFoundPage">
      <div className="notFoundCard">
        <h1 className="notFoundTitle">404</h1>
        <p className="notFoundText">Oops! Page not found</p>
        <a href="/" className="notFoundLink">
          Return to Home
        </a>
      </div>
    </div>
  );
}

