import React from "react";

const Heading = ({ isOpen, toggleSidebar }) => {
  return (
    <div className="bg-word-gradient text-white h-16 px-6 flex justify-between items-center">
      {/* Logo */}
      <h1 className="flex gap-2 items-center">
         <h1 className="text-xl font-bold text-white tracking-tight">
          ME<span className="text-blue-400">-Notes</span>
        </h1>
      </h1>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Dashboard</h1>

        {/* Mobile only */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>
    </div>
  );
};

export default Heading;