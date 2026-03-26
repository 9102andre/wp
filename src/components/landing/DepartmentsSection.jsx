import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Baby, Bone, ChevronRight, Ear, HeartPulse, Palette, Stethoscope, Thermometer } from "lucide-react";

const departments = [
  {
    name: "ENT",
    icon: Ear,
    color: "199 89% 38%",
    conditions: ["Ear pain", "Nose block", "Throat infection", "Hearing loss"],
  },
  {
    name: "Gynecology",
    icon: Baby,
    color: "330 70% 50%",
    conditions: ["Pregnancy", "Menstrual irregularities", "PCOS", "Infertility"],
  },
  {
    name: "General Medicine",
    icon: Thermometer,
    color: "168 60% 40%",
    conditions: ["Fever", "Cold", "Weakness", "Body pain"],
  },
  {
    name: "Dermatology",
    icon: Palette,
    color: "25 90% 55%",
    conditions: ["Skin rashes", "Acne", "Allergies", "Infections"],
  },
  {
    name: "Orthopedics",
    icon: Bone,
    color: "260 60% 55%",
    conditions: ["Bone pain", "Fractures", "Joint stiffness", "Spine care"],
  },
  {
    name: "Cardiology",
    icon: HeartPulse,
    color: "0 75% 55%",
    conditions: ["Chest pain", "Breathlessness", "BP issues", "Heart screening"],
  },
  {
    name: "Pediatrics",
    icon: Stethoscope,
    color: "45 90% 50%",
    conditions: ["Child illness", "Vaccination", "Growth concerns", "Nutrition"],
  },
];

export default function DepartmentsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState(null);

  return (
    <section id="departments" className="section departmentsSection" ref={ref}>
      <div className="departmentsDecor" />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="sectionHeader"
        >
          <span className="kicker">Specializations</span>
          <h2 className="titleLg">
            7 Departments, <span className="textGradient">One Promise</span>
          </h2>
          <p className="muted departmentsLead">
            Each department is powered by AI-assisted diagnosis, helping doctors make faster, more accurate decisions.
          </p>
        </motion.div>

        <div className="deptGrid">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="deptCard"
            >
              {/* Color accent bar */}
              <div
                className="deptAccent"
                style={{
                  background: `hsl(${dept.color})`,
                  opacity: hovered === i ? 1 : 0.4,
                }}
              />

              <div
                className="deptIconBox"
                style={{ background: `hsl(${dept.color} / 0.12)` }}
              >
                <dept.icon width={24} height={24} style={{ color: `hsl(${dept.color})` }} />
              </div>

              <h3 className="deptTitle">{dept.name}</h3>

              <ul className="deptList">
                {dept.conditions.map((c) => (
                  <li key={c} className="deptItem">
                    <ChevronRight width={14} height={14} />
                    {c}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

