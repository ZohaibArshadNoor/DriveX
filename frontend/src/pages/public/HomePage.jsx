import Navbar from "../../components/shared/Navbar";
import HeroSection from "../../components/shared/HeroSection";
import FeaturesSection from "../../components/shared/FeaturesSection";
import VehicleShowcase from "../../components/shared/VehicleShowcase";
import Footer from "../../components/shared/Footer";

function HomePage() {
  return (
    <>
      <Navbar />

      <HeroSection />

      <FeaturesSection />

      <VehicleShowcase />

      <Footer />
    </>
  );
}

export default HomePage;