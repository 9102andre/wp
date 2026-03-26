import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container">
        <div className="footerGrid">
          <div>
            <div className="footerBrand">
              <Heart width={20} height={20} style={{ color: "hsl(var(--primary))" }} />
              <span className="footerBrandName">Wecare</span>
            </div>
            <p className="footerText">
              Advanced AI-assisted diagnostics and compassionate healthcare since 1998.
            </p>
          </div>
          <div>
            <h4 className="footerTitle">Quick Links</h4>
            <ul className="footerLinks">
              {["About", "Departments", "Contact", "Login"].map((l) => (
                <li key={l}>
                  <a href={`#${l.toLowerCase()}`} className="footerLink">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="footerTitle">Departments</h4>
            <ul className="footerLinks">
              {["ENT", "Cardiology", "Orthopedics", "Pediatrics"].map((d) => (
                <li key={d} className="footerDim">
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="footerTitle">Emergency</h4>
            <p className="footerEmergency">108</p>
            <p className="footerText">Available 24/7</p>
          </div>
        </div>
        <div className="footerBottom">
          © {new Date().getFullYear()} Wecare Hospitals & Research Centre. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

