import Seo from '../components/Seo';

function AboutPage() {
  return (
    <>
      <Seo
        title="About - Likai Wang"
        description="Shenzhen-based designer focused on the intersection of Intelligent Systems and Hardware Interaction, transitioning from visual and motion design to functional, hardware-led products."
        image="/img/about/Kowsky Plaza_Glass img.png"
      />
      <section className="container">
<article className="portfolio-item">
          <div className="content">
            <picture>
              <source srcSet="/img/about/Kowsky Plaza_Glass img.webp" type="image/webp" />
              <img
                className="kowsky-plaza-glass"
                src="/img/about/Kowsky Plaza_Glass img.png"
                alt="Kowsky Plaza Glass Image"
              />
            </picture>
          </div>
          <div className="content">
            <img
              className="good-luck"
              src="/img/about/Good Luck.webp"
              alt="Good Luck"
            />
          </div>
        </article>

          <article className="about-bio">
            <div className="about-bio-paragraph">
              <p className="about-bio-paragraph">
                Designer | Intelligent Systems & Hardware <br />
                Shenzhen-based designer focused on the intersection of Intelligent Systems and Hardware Interaction. Transitioning from a visual and motion design foundation to building functional, hardware-led products integrated system.<br />
                His approach balances aesthetic precision with systemic logic, aiming to translate complex AI capabilities into tangible, human-centric hardware experiences.<br />
                “I’m quite comfortable working with imperfect systems and constraints, because that’s usually where real design decisions matter.”
              </p>
            </div>

            <div className="contact-info">
              <h3>Contact</h3>
              <a href="mailto:peterwanglikai@gmail.com" target="_blank" rel="noreferrer">
                <p>peterwanglikai@gmail.com</p>
              </a>
            </div>

            <div className="software-skills">
              <h3>Software/Skill</h3>
              <p>
                Adobe Creative Suite (Photoshop, Illustrator, After Effects), Figma<br />
                Fusion 360, Blender, Rhino 3D<br />
                User Flow Mapping, System Logic Design, Wireframing, HCI Principles<br />
                ESP32, Arduino, Physical Computing, Sensor & Actuator Integration<br />
                C++ , Python , HTML/CSS，React<br />
                QGIS<br />
              </p>
            </div>
          </article>
        </section>
    </>
  );
}

export default AboutPage;
