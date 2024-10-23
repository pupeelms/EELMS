import React from 'react';
import "./aboutPage.scss";
import { Mail, Language } from '@mui/icons-material'; // Import MUI icons

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Section 1: About Us */}
      <div className="about-section">
        <h1>ABOUT US</h1>
        <p>
          Welcome to EELMS, the future of Electrical Engineering Laboratory Management at Polytechnic University of the Philippines! 
          Say goodbye to cumbersome, manual processes and hello to streamlined efficiency with our revolutionary application. 
          Our innovative platform transforms the way you organize, manage inventory, and handle the borrowing and returning of tools and equipment, 
          ensuring that every aspect of lab operations runs smoothly and effectively.
        </p>
      </div>

      {/* Section 2: Project About */}
      <div className="project-about">
        <h2>PROJECT ABOUT</h2>
        <p>
          Developed by a dedicated team of aspiring engineers who have journeyed together from our early years in college, our diverse interests and unique perspectives converge to meet on the same wavelength, driven by our passion for engineering excellence. EELMS is not just a tool; it's a testament to teamwork, innovation, and the relentless pursuit of progress in the world of electrical engineering.
        </p>
      </div>

      {/* Section 3: Vision and Mission */}
      <div className="vision-mission">
        <div className="vision-mission-row">
          <div className="vision">
            <h2>OUR VISION</h2>
            <p>
              Our vision is to revolutionize the electrical engineering laboratory experience at Polytechnic University of the Philippines by pioneering a seamless, efficient, and innovative approach to laboratory management.
            </p>
          </div>
          <div className="vision-image">
            <img src="/21.png" alt="Vision" /> {/* Replace with actual image path */}
          </div>
        </div>

        <div className="vision-mission-row">
        <div className="mission-image">
            <img src="/22.png" alt="Mission" /> {/* Replace with actual image path */}
          </div>
          <div className="mission">
            <h2>OUR MISSION</h2>
            <p>
              Our mission is to transform outdated manual processes into a streamlined digital ecosystem. We aim to enhance organization, simplify inventory management, and optimize the borrowing and returning of tools and equipment. Through EELMS, we empower students and educators alike, promoting engineering excellence and fostering a culture of teamwork, innovation, and progress.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Team Story */}
      <div className="team-story">
        <h2>TEAM STORY</h2>
        <p>
          Four engineering students, each with a passion for innovation and a drive to make a difference, embarked on a journey to revolutionize 
          the Electrical Engineering Laboratory of Polytechnic University of the Philippines. From their early years, their bond was forged through 
          long nights of studying, endless group projects, and a shared vision for a brighter, more efficient future.
        </p>

        <p>
          One day, as they struggled with the cumbersome, outdated inventory management system of their lab, the spark of inspiration struck. 
          "Why not create an application to streamline this entire process?" The idea resonated deeply with the group. They saw the potential 
          to transform the chaos of manual borrowing and returning of tools into a seamless digital experience.
        </p>

        <p>
          The team began brainstorming and sketching out plans in the Gabriela Silang Hall, each member contributing their unique skills and perspectives. 
          There was Erika, a dedicated coder, who constantly learning the wonders of coding; Carmelle, the organizational wizard, who had a knack for creating efficient workflows; 
          Rose, the tech-savvy designer, whose eye for detail brought their vision to life; and Mary, the problem-solver, who could troubleshoot and refine their ideas until they shone.
        </p>

        <p>
          They named their project EELMS, an acronym for Electrical Engineering Laboratory Management System. With a clear goal in mind, they divided tasks and set milestones. 
          Their days were filled with classes and their nights with coding sessions, sometimes lasting until the early hours of the morning. They faced numerous challenges along the way: 
          bugs in the system, disagreements on design choices, and the pressure of balancing their studies with their ambitious project.
        </p>

        <p>
          But their determination never wavered. Every obstacle they encountered only strengthened their resolve. They sought guidance from professors, conducted user testing 
          with fellow students, and iterated on their designs until the application was as intuitive and efficient as they envisioned.
        </p>

        <p>
          Through their journey, they not only developed a groundbreaking application but also forged a deeper bond as a team. Their story is an inspiration, 
          a testament to what can be achieved through collaboration, perseverance, and a shared vision for progress. EELMS was not just an application; it was a reflection 
          of their journey, their passion, and their commitment to making a difference in the world of engineering.
        </p>

        <blockquote>
          "Awa na lang"
          <cite>PUPian est. 2024</cite>
        </blockquote>
      </div>

      {/* Section 5: The Team */}
      <div className="team-section">
        <h2>THE TEAM</h2>
        <div className="team-grid">
          <div className="team-member">
            <img src="/tolitol.jpg" alt="Erika" />
            <h3>Erika</h3>
            <p>A dedicated coder, constantly learning and refining her craft.</p>
          </div>
          <div className="team-member">
            <img src="/padilla.jpg" alt="Carmelle" />
            <h3>Carmelle</h3>
            <p>The organizational wizard, who had a knack for creating efficient workflows.</p>
          </div>
          <div className="team-member">
            <img src="/gramatica.jpg" alt="Rose" />
            <h3>Rose</h3>
            <p>The tech-savvy designer, whose eye for detail brought their vision to life.</p>
          </div>
          <div className="team-member">
            <img src="/labajanan.jpg" alt="Mary" />
            <h3>Mary</h3>
            <p>The problem-solver, who could troubleshoot and refine their ideas until they shone.</p>
          </div>
        </div>
      </div>

      {/* Section 6: Footer */}
      <div className="footer">
        <div className="contact-info">
          <div className="contact-item">
            <Language className="icon" />
            <a href="http://pupeelms.com" className="text" target="_blank" rel="noopener noreferrer">
              PUP EELMS
            </a>
          </div>
          <div className="contact-item">
            <Mail className="icon" />
            <a href="mailto:pupeelms@gmail.com" className="text">
              pupeelms@gmail.com
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
