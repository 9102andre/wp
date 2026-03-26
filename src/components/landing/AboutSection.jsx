import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2, Eye, Target } from "lucide-react";

const milestones = [
  "Founded in 1998 with a vision to democratize healthcare",
  "Expanded to 7 specialized departments with 200+ beds",
  "Adopted AI-assisted diagnostics in 2023",
  "Serving 50,000+ patients annually",
];

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="section aboutSection" ref={ref}>
      {/* Decorative */}
      <div className="aboutDecor" />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="sectionHeader"
        >
          <span className="kicker">About Us</span>
          <h2 className="titleLg">
            A Legacy of <span className="textGradient">Compassionate</span> Care
          </h2>
          <p className="muted aboutLead">
            For over two decades, Wecare has been at the forefront of medical excellence, blending traditional
            care with cutting-edge technology.
          </p>
        </motion.div>

        <div className="grid2 aboutGrid">
          {/* Vision & Mission */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="stackLg"
          >
            <div className="card aboutCard">
              <div className="aboutCardHeader">
                <div className="aboutIconBox aboutIconBoxPrimary">
                  <Eye width={20} height={20} />
                </div>
                <h3 className="aboutCardTitle">Our Vision</h3>
              </div>
              <p className="muted aboutCardText">
                To be the most trusted healthcare institution in the region, delivering personalized, AI-enhanced
                medicine accessible to every patient.
              </p>
            </div>

            <div className="card aboutCard">
              <div className="aboutCardHeader">
                <div className="aboutIconBox aboutIconBoxSecondary">
                  <Target width={20} height={20} />
                </div>
                <h3 className="aboutCardTitle">Our Mission</h3>
              </div>
              <p className="muted aboutCardText">
                Provide comprehensive, patient-centered healthcare using advanced diagnostics, evidence-based treatment,
                and a culture of empathy.
              </p>
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <h3 className="aboutJourneyTitle">Our Journey</h3>
            <div className="stackMd">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  className="aboutMilestone"
                >
                  <CheckCircle2 width={18} height={18} />
                  <p className="aboutMilestoneText">{m}</p>
                </motion.div>
              ))}
            </div>

            {/* Accreditations */}
            <div className="aboutAccreditations">
              <p className="aboutAccreditationsLabel">Accreditations</p>
              <div className="aboutBadges">
                {["NABH", "ISO 9001", "JCI", "NABL"].map((a) => (
                  <span key={a} className="aboutBadge">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

