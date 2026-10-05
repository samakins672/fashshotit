import { Link } from "react-router";

export default function NotFound() {
  return (
    <section className="section not-found">
      <div className="container">
        <h1 className="project-title">Page not found</h1>
        <p>The page you're looking for doesn't exist or has moved.</p>
        <p>
          <Link to="/" className="btn">
            Back home
          </Link>
        </p>
      </div>
    </section>
  );
}
