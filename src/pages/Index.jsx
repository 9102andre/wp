import Navbar from "@/components/landing/Navbar.jsx";
import HeroSection from "@/components/landing/HeroSection.jsx";
import AboutSection from "@/components/landing/AboutSection.jsx";
import DepartmentsSection from "@/components/landing/DepartmentsSection.jsx";
import ContactSection from "@/components/landing/ContactSection.jsx";
import LoginSection from "@/components/landing/LoginSection.jsx";
import Footer from "@/components/landing/Footer.jsx";

export default function Index() {
  return (
    <div className="appPage">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <DepartmentsSection />
      <ContactSection />
      <LoginSection />
      <Footer />
    </div>
  );
}

