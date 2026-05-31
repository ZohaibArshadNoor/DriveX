function VehicleShowcase() {
  const vehicles = [
    {
      name: "Toyota Corolla",
      price: "Rs.7000/day",
    },
    {
      name: "Honda Civic",
      price: "Rs.8000/day",
    },
    {
      name: "Kia Sportage",
      price: "Rs8500/day",
    },
  ];

  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className="
          text-4xl
          font-bold
          text-center
          mb-12
          "
        >
          Popular Vehicles
        </h2>

        <div
          className="
          grid
          md:grid-cols-3
          gap-6
          "
        >
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.name}
              className="
              bg-white
              rounded-lg
              shadow-lg
              p-6
              "
            >
              <div
                className="
                h-48
                bg-gray-300
                rounded
                mb-4
                "
              />

              <h3 className="text-xl font-bold">{vehicle.name}</h3>

              <p className="mt-2">{vehicle.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VehicleShowcase;
