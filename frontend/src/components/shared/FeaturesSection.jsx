function FeaturesSection() {
  const features = [
    {
      title: "Verified Drivers",
      description: "Identity verification before booking.",
    },
    {
      title: "Secure Booking",
      description: "Conflict-free booking system.",
    },
    {
      title: "Admin Approval",
      description: "Booking workflow managed by admin.",
    },
    {
      title: "Fast Rentals",
      description: "Easy and quick reservation process.",
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className="
          text-4xl
          font-bold
          text-center
          mb-12
          "
        >
          Features
        </h2>

        <div
          className="
          grid
          md:grid-cols-4
          gap-6
          "
        >
          {features.map((item) => (
            <div
              key={item.title}
              className="
              shadow-lg
              rounded-lg
              p-6
              bg-white
              "
            >
              <h3 className="font-bold text-xl mb-3">{item.title}</h3>

              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
