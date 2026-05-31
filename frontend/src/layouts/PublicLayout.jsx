import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Outlet />
    </div>
  );
}

export default PublicLayout;
