import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  const options = ["Logout", "Visit Profile"];

  const logout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleClick = (item) => {
    if (item === "Logout") {
      logout();
    } 
    // else if (item === "Visit Profile") {
    //   navigate("/profile");
    // }
  };

  return (
    <div className="max-h-[25vh] overflow-y-auto rounded-lg bg-white shadow-lg border border-gray-200">
      {options.map((item) => (
        <div
          key={item}
          role="button"
          tabIndex={0}
          onClick={() => handleClick(item)}
          onKeyDown={(e) => e.key === "Enter" && handleClick(item)}
          className="flex items-center justify-between px-3 py-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
        >
          <span className="flex-1 text-sm text-gray-700 truncate">
            {item}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Settings;