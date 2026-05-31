import { useAuthStore } from "../../store/authStore";

function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome {user?.full_name || "User"}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Bookings</p>
          <h2 className="text-xl font-bold">--</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Active Bookings</p>
          <h2 className="text-xl font-bold">--</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Pending Payments</p>
          <h2 className="text-xl font-bold">--</h2>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Recent Bookings</h2>
        <p className="text-gray-500 text-sm">
          No data yet (we will connect API next step)
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
