import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

function NotFoundPage() {
  return (
    <>
      <Seo
        title="404 - Likai Wang"
        description="The page you are looking for does not exist."
      />
      <section className="not-found">
        <h1>404</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/">Back to Home</Link>
      </section>
    </>
  );
}

export default NotFoundPage;