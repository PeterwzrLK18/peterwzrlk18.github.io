import Seo from '../components/Seo';

const paragraphClass =
  'relative max-w-[760px] font-mono font-normal text-[var(--color-text-brand-default)] text-base tracking-normal leading-[120%] max-tablet:text-[var(--fs-body)] max-tablet:leading-[var(--lh-normal)] max-tablet:break-words';

function AboutPage() {
  return (
    <>
      <Seo
        title="About - Likai Wang"
        description="Shenzhen-based designer focused on the intersection of Intelligent Systems and Hardware Interaction, transitioning from visual and motion design to functional, hardware-led products."
        image="/img/about/Kowsky Plaza_Glass img.png"
      />
      <section className="flex flex-wrap justify-start gap-10 mx-auto w-full max-w-[1720px] px-[var(--side-padding)]">
        <article className="flex flex-col w-[390px] items-start relative overflow-auto gap-5">
          <div className="flex items-end relative self-stretch w-full flex-none bg-[var(--color-background-neutral-default)]">
            <picture>
              <source srcSet="/img/about/Kowsky Plaza_Glass img.webp" type="image/webp" />
              <img
                className="relative w-[100px] h-[140px]"
                src="/img/about/Kowsky Plaza_Glass img.png"
                alt="Kowsky Plaza Glass Image"
              />
            </picture>
          </div>
          <div className="flex items-end relative self-stretch w-full flex-none bg-[var(--color-background-neutral-default)]">
            <img
              className="relative max-w-full"
              src="/img/about/Good Luck.webp"
              alt="Good Luck"
            />
          </div>
        </article>

        <article className="w-[760px] flex flex-col items-start gap-5 relative max-wide:w-full">
          <div className={paragraphClass}>
            <p className={paragraphClass}>
              Designer | Intelligent Systems &amp; Hardware <br />
              Shenzhen-based designer focused on the intersection of Intelligent Systems and Hardware Interaction. Transitioning from a visual and motion design foundation to building functional, hardware-led products integrated system.<br />
              His approach balances aesthetic precision with systemic logic, aiming to translate complex AI capabilities into tangible, human-centric hardware experiences.<br />
              &ldquo;I&rsquo;m quite comfortable working with imperfect systems and constraints, because that&rsquo;s usually where real design decisions matter.&rdquo;
            </p>
          </div>

          <div className="relative w-full max-w-[760px]">
            <h3>Contact</h3>
            <a href="mailto:peterwanglikai@gmail.com" target="_blank" rel="noreferrer">
              <p className={`${paragraphClass} text-[#ec221f]`}>
                peterwanglikai@gmail.com
              </p>
            </a>
          </div>

          <div className="relative w-full max-w-[760px]">
            <h3>Software/Skill</h3>
            <p className={`${paragraphClass} w-full`}>
              Adobe Creative Suite (Photoshop, Illustrator, After Effects), Figma<br />
              Fusion 360, Blender, Rhino 3D<br />
              User Flow Mapping, System Logic Design, Wireframing, HCI Principles<br />
              ESP32, Arduino, Physical Computing, Sensor &amp; Actuator Integration<br />
              C++ , Python , HTML/CSS, React<br />
              QGIS<br />
            </p>
          </div>
        </article>
      </section>
    </>
  );
}

export default AboutPage;