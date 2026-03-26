import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, Clock, Mail, MapPin, Phone } from "lucide-react";

const contactInfo = [
  { icon: MapPin, label: "Address", value: "42 Healthcare Avenue, Medical District, Metro City – 560001" },
  { icon: Phone, label: "Phone", value: "+91 80 4567 8900" },
  { icon: AlertTriangle, label: "Emergency", value: "108 (24/7 Helpline)" },
  { icon: Mail, label: "Email", value: "caring@metropolishospital.com" },
  { icon: Clock, label: "Hours", value: "Mon – Sat: 8:00 AM – 9:00 PM" },
];

export default function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" className="section contactSection" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="sectionHeader"
        >
          <span className="kicker">Get In Touch</span>
          <h2 className="titleLg">
            We&apos;re Here <span className="textGradient">For You</span>
          </h2>
        </motion.div>

        <div className="contactGrid">
          {contactInfo.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1 }}
              className={`contactCard ${item.label === "Emergency" ? "contactCardEmergency" : ""}`}
            >
              <div
                className={`contactIconBox ${item.label === "Emergency" ? "contactIconEmergency" : "contactIconPrimary"}`}
              >
                <item.icon width={20} height={20} />
              </div>
              <p className="contactLabel">{item.label}</p>
              <p className="contactValue">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Interactive Google Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="contactMap"
          style={{ padding: 0, overflow: "hidden", borderRadius: "1.25rem", border: "1px solid hsl(var(--border))" }}
        >
          <iframe
            title="Hospital Location"
            width="100%"
            height="340"
            style={{ display: "block", border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.948!2d77.5945!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          />
        </motion.div>
      </div>
    </section>
  );
}

