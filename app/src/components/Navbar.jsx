import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (tab) => {
    if (tab === 'work') return path === '/' || path.startsWith('/work/');
    if (tab === 'about') return path === '/about';
    return false;
  };

  return (
    <header className="navigation">
      <div className="logo-wrapper">
        <Link to="/" className="text-wrapper">likai.wang</Link>
      </div>
      <nav className="navigation-wrap">
        <div className={`nav-item workbutton ${isActive('work') ? 'active' : ''}`}>
          <Link to="/">WORK</Link>
        </div>
        <div className={`nav-item aboutbutton ${isActive('about') ? 'active' : ''}`}>
          <Link to="/about">ABOUT</Link>
        </div>
        <div className="nav-item resumebutton">
          <a href="/docs/王立凯 中文简历.docx.pdf" target="_blank" rel="noopener noreferrer">RESUME</a>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;