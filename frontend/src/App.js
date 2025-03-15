import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Manager from "./components/Manager";
import Inventory from "./components/Inventory";
import Cashier from "./components/Cashier";
import Employees from "./components/Employees";
import ManagerMenu from "./components/ManagerMenu";
import MenuBoardEntrees from "./components/MenuBoardEntrees";
import MenuBoardSides from "./components/MenuBoardSides";
import MenuSelection from "./components/MenuSelection";
import MenuBoardPricing from "./components/MenuBoardPricing";
import Kitchen from "./components/Kitchen";
import KioskLanding from "./components/KioskLanding";
import KioskCheckout from "./components/KioskCheckout";

import "./App.css";

/**
 * The main application component that defines the routing structure for the application.
 *
 * @component
 * @returns {JSX.Element} The rendered application with defined routes.
 */
function App() {
  return (
    <Router>
      <div>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/manager" element={<Manager />} />
          <Route path="/cashier" element={<Cashier />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/managerMenu" element={<ManagerMenu />} />
          <Route path="/menu-selection" element={<MenuSelection />} />
          <Route path="/menu-pricing" element={<MenuBoardPricing />} />
          <Route path="/menu-entrees" element={<MenuBoardEntrees />} />
          <Route path="/menu-sides" element={<MenuBoardSides />} />
          <Route path="/kiosk-landing" element={<KioskLanding />} />
          <Route path="/kiosk-checkout" element={<KioskCheckout />} />
          <Route path="/kitchen" element={<Kitchen />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
