/**
 * @module Frontend/Menu
 */
import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * @component MenuSelection
 * 
 * A React functional component that renders a selection menu for navigating to different menu sections. 
 * It provides buttons for navigating to the Pricing, Entrees, and Sides sections of the application.
 * @memberof module:Frontend/Menu
 * @returns {JSX.Element} A styled menu selection screen with navigation options.
 */
const MenuSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Select Menu</h2>
          <button
            onClick={() => navigate("/menu-pricing")}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-lg shadow transition-colors duration-200 active:scale-95 mb-4 w-full"
          >
            Pricing
          </button>
          <button
            onClick={() => navigate("/menu-entrees")}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-lg shadow transition-colors duration-200 active:scale-95 mb-4 w-full"
          >
            Entrees
          </button>
          <button
            onClick={() => navigate("/menu-sides")}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-lg shadow transition-colors duration-200 active:scale-95 w-full"
          >
            Sides and More
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuSelection;
