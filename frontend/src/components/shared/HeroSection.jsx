import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section
      className="
      bg-gradient-to-r
      from-black
      to-gray-900
      text-white
      min-h-[80vh]
      flex
      items-center
      "
    >
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-6xl font-bold mb-6">Premium Car Rental</h1>

        <p className="text-xl mb-8 max-w-xl">
          Rent luxury and economy vehicles with secure bookings and fast
          approval.
        </p>

        <div className="flex gap-4">
          <Link
            to="/register"
            className="
            bg-blue-600
            px-6
            py-3
            rounded-lg
            "
          >
            Get Started
          </Link>

          <Link
            to="/vehicles"
            className="
            border
            px-6
            py-3
            rounded-lg
            "
          >
            Browse Vehicles
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
