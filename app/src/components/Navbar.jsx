import { Link, useLocation } from 'react-router-dom';

const navLinkBase =
  'text-[var(--color-text-brand-tertiary)] transition-[color,font-weight] duration-200 ease-out rounded-sm px-1 py-0.5 -mx-1 -my-0.5 group-hover:text-[var(--color-brand-900)] group-hover:font-semibold focus-visible:outline-2 focus-visible:outline-[#4a90e2] focus-visible:outline-offset-2 max-tablet:text-[12px] max-tablet:uppercase max-tablet:tracking-[0.05em]';

const navLinkActive = 'text-[var(--color-brand-900)] font-semibold';

const brandLinkClass =
  'font-heading font-semibold text-[var(--color-text-brand-default)] text-[clamp(14px,0.6rem+0.9vw,24px)] tracking-normal leading-[120%] focus-visible:outline-2 focus-visible:outline-[#4a90e2] focus-visible:outline-offset-2 max-tablet:text-[12px] max-tablet:uppercase max-tablet:tracking-[0.05em]';

const headerClass =
  'flex items-baseline justify-between self-stretch w-full max-w-[1720px] mx-auto h-[clamp(72px,4rem+2vw,90px)] py-[clamp(24px,1rem+0.6vw,30px)] px-[var(--side-padding)] bg-[var(--color-background-default-default)] max-navcol:flex-col max-navcol:items-start';

const navClass =
  'flex items-center justify-between relative w-[299px] max-navcol:w-full max-navcol:flex-nowrap max-navcol:justify-start max-navcol:gap-5 max-navcol:mt-2';

function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (tab) => {
    if (tab === 'work') return path === '/' || path.startsWith('/work/');
    if (tab === 'about') return path === '/about';
    return false;
  };

  return (
    <div className={headerClass}>
      <div>
        <Link to="/" className={brandLinkClass}>
          likai.wang
        </Link>
      </div>
      <nav className={navClass}>
        <div className="group">
          <Link to="/" className={`${navLinkBase} ${isActive('work') ? navLinkActive : ''}`}>
            WORK
          </Link>
        </div>
        <div className="group">
          <Link to="/about" className={`${navLinkBase} ${isActive('about') ? navLinkActive : ''}`}>
            ABOUT
          </Link>
        </div>
        <div className="group">
          <a
            href="/docs/王立凯 中文简历.docx.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={navLinkBase}
          >
            RESUME
          </a>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;