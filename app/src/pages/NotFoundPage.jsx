import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

function NotFoundPage() {
  return (
    <>
      <Seo
        title="404 — Likai Wang"
        description="The page you are looking for does not exist."
      />
      <section className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-[var(--side-padding)] py-20 text-center">
        <h1 className="font-mono font-bold text-[var(--color-brand-900)] text-[clamp(64px,12vw,140px)] leading-[1] tracking-[-0.04em]">
          404
        </h1>
        <p className="font-mono text-[var(--color-brand-500)] text-[clamp(16px,0.8rem+0.6vw,20px)] leading-[1.4] max-w-[480px]">
          The page you are looking for does not exist, or has moved.
        </p>
        <Link
          to="/"
          className="font-heading font-semibold text-[var(--color-brand-800)] text-[clamp(14px,0.6rem+0.9vw,24px)] tracking-normal border border-[var(--color-brand-800)] rounded-sm px-6 py-3 transition-colors duration-200 ease-out hover:bg-[var(--color-brand-800)] hover:text-[var(--color-paper)] focus-visible:outline-2 focus-visible:outline-[#4a90e2] focus-visible:outline-offset-2"
        >
          Back to Home
        </Link>
      </section>
    </>
  );
}

export default NotFoundPage;