import { NavLink, Outlet, useSearchParams } from "react-router-dom";

const WritingPage = () => {
  const [searchParams] = useSearchParams();

  return (
    <div className="flex flex-col w-full px-4 md:px-8 py-10">

      {/* TABS (URL BASED) */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <NavLink
          to="/writing"
          end
          className={({ isActive }) =>
            `px-4 py-2 rounded-full transition ${
              isActive ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`
          }
        >
          🔍 Explore
        </NavLink>

        <NavLink
          to="/writing/write"
          className={({ isActive }) =>
            `px-4 py-2 rounded-full transition ${
              isActive ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`
          }
        >
          ✍️ Write
        </NavLink>

        <NavLink
          to="/writing/my"
          className={({ isActive }) =>
            `px-4 py-2 rounded-full transition ${
              isActive ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`
          }
        >
          📚 My Writings
        </NavLink>

        <NavLink
          to="/writing/saved"
          className={({ isActive }) =>
            `px-4 py-2 rounded-full transition ${
              isActive ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`
          }
        >
          🔖 Saved
        </NavLink>

        <NavLink
          to="/writing/following"
          className={({ isActive }) =>
            `px-4 py-2 rounded-full transition ${
              isActive ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`
          }
        >
          👥 Following
        </NavLink>
      </div>

      {/* TAB CONTENT (CHANGES VIA URL) */}
      <Outlet />
    </div>
  );
};

export default WritingPage;
