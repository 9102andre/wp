import { motion } from "framer-motion";
import { ArrowDown, Award, Clock, Shield } from "lucide-react";
import { Button } from "@/ui/Button.jsx";

const stats = [
  { icon: Shield, value: "25+", label: "Years of Trust" },
  { icon: Clock, value: "24/7", label: "Emergency Care" },
  { icon: Award, value: "50+", label: "Expert Doctors" },
];

export default function HeroSection() {
  return (
    <section id="home" className="hero">
      {/* Background gradient */}
      <div className="heroBg" />
      {/* Animated shapes */}
      <motion.div
        className="heroShape heroShapeOne"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="heroShape heroShapeTwo"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Grid pattern overlay */}
      <div className="heroGridOverlay" />

      <div className="container heroInner">
        <div className="heroGrid">
          {/* Left text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="heroBadge"
            >
              <span className="heroPulse" />
              NABH Accredited • ISO 9001:2015
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="heroTitle"
            >
              Where <span className="heroLightItalic">Healing</span>{" "}
              <br className="heroBreak" />
              Meets{" "}
              <span className="heroUnderline">
                Innovation
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="heroSub"
            >
              Advanced AI-assisted diagnostics, compassionate care, and world-class specialists — all under one roof.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="heroCtas"
            >
              <Button
                size="lg"
                className="heroCtaBtn"
                onClick={() => document.querySelector("#login")?.scrollIntoView({ behavior: "smooth" })}
              >
                Book Appointment
              </Button>
              <Button
                size="lg"
                className="heroCtaBtn"
                onClick={() => document.querySelector("#departments")?.scrollIntoView({ behavior: "smooth" })}
              >
                Our Departments
              </Button>
            </motion.div>
          </div>

          {/* Right stats cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="heroStats"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.15 }}
                className="heroStatCard glass"
              >
                <div className="heroStatIcon">
                  <s.icon width={28} height={28} color="white" />
                </div>
                <div>
                  <p className="heroStatValue">{s.value}</p>
                  <p className="heroStatLabel">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="scrollHint"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown width={20} height={20} style={{ opacity: 0.55 }} />
        </motion.div>
      </div>
    </section>
  );
}

