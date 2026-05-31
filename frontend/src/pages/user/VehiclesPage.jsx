import { useEffect, useState } from "react";

import { vehicleService } from "../../services/vehicleService";

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await vehicleService.getVehicles();

        setVehicles(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadVehicles();
  }, []);

  return (
    <div>
      <h1
        className="
        text-3xl
        font-bold
        mb-6
        "
      >
        Vehicles
      </h1>

      <div
        className="
        grid
        md:grid-cols-3
        gap-6
        "
      >
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="
            bg-white
            shadow
            rounded
            p-5
            "
          >
            <img
              src={vehicle.thumbnail}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-48 object-cover rounded"
            />

            <h2
              className="
              text-xl
              font-bold
              "
            >
              {vehicle.model} {vehicle.year}
            </h2>

            <h3 className="text-lg font-semibold text-gray-700">
              {vehicle.brand}
            </h3>

            <p className="text-xl font-bold text-green-600 mt-2">
              Rs. {vehicle.price_per_day}
              /day
            </p>

            <p className="text-600 font-bold mt-2">
              {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
            </p>

            <p className="text-800 font-semibold mt-2">
              {vehicle.category.charAt(0).toUpperCase() +
                vehicle.category.slice(1)}
            </p>

            <p className="text-gray-600 mt-2">
              {vehicle.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VehiclesPage;
