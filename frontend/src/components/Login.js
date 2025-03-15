/**
 * @module Frontend/Login
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import panda from "../assets/panda.png";

/**
 * Login component handles the user login process using a PIN-based system.
 * It allows for numeric input to build a PIN, processes the entered PIN 
 * to determine the role of the user, and navigates to different pages based 
 * on the user's role.
 * 
 * @component
 * @memberof module:Frontend/Login
 */
function Login() {
  const [pin, setPin] = useState("");
  const [role, setRole] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  const determineRole = (email) => {
    const adminEmails = ["jarren.tobias24@gmail.com", "hdav3228@tamu.edu"];
    const managerEmails = ["jarren.tobias@tamu.edu", "hdav3228@tamu.edu"];

    if (adminEmails.includes(email)) return "admin";
    if (managerEmails.includes(email)) return "manager";
    return "employee";
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Google login success:", decoded);

    const userRole = determineRole(decoded.email);
    setRole(userRole);
    setEmployee(decoded.name);
    setUserEmail(decoded.email);
    localStorage.setItem("employee", decoded.name);
    localStorage.setItem("role", userRole);
    localStorage.setItem("email", decoded.email);
  };

  const handleGoogleError = () => {
    console.error("Google login failed");
    alert("Login failed. Please try again.");
  };

  const handleInput = useCallback(
    (num) => {
      if (pin.length < 4) {
        setPin((prev) => prev + num);
      }
    },
    [pin]
  );

  const handleClear = useCallback(() => {
    setPin("");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!userEmail) {
      alert("Please log in with Google first.");
      return;
    }

    if (pin === "1234") {
      if (role === "admin" || role === "manager") {
        navigate("/manager");
      } else {
        alert("You don't have permission to access this area.");
        setPin("");
      }
    } else if (pin === "0000") {
      navigate("/kiosk-landing");
    } else if (pin === "1111") {
      navigate("/menu-selection");
    } else if (pin === "3333") {
      navigate("/kitchen");
    } else {
      try {
        console.log(`Fetching employee with PIN: ${pin}`);
        const response = await fetch(
          `https://pandabackend-six.vercel.app/api/employees/get-employee/${pin}`
        );

        if (!response.ok) {
          throw new Error("Invalid PIN");
        }

        const employeeData = await response.json();
        const employeeRole = employeeData.role.toLowerCase().trim();
        const name = employeeData.name.trim();
        const activeStatus = employeeData.active_status;

        if (activeStatus === null) {
          alert("Your account has been terminated. Please contact your manager.");
          setPin("");
          return;
        }

        localStorage.setItem("employee", name);
        localStorage.setItem("role", employeeRole);

        if (employeeRole === "employee") {
          navigate("/cashier");
        } else if (role === "kiosk") {
          console.log("Navigating to /kiosk-landing");
          navigate("/kiosk-landing");
        } else {
          alert("Invalid role");
          setPin("");
        }
      } catch (error) {
        alert(error.message);
        setPin("");
      }
    }
  }, [pin, navigate, role, userEmail]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      if (/^[0-9]$/.test(key)) {
        handleInput(parseInt(key));
      } else if (key === "Enter") {
        handleSubmit();
      } else if (key === "Backspace" || key === "Delete") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleInput, handleSubmit, handleClear]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center">
          <img
            src={panda}
            alt="Logo"
            className="w-32 h-32 mb-6 animate-bounce shadow-lg transform transition-transform duration-300 hover:scale-110 rounded-full object-cover"
          />

          {!userEmail ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome</h2>
              <div className="mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  text="signin_with"
                  shape="rectangular"
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Enter PIN
              </h2>
              <p className="mb-4 text-gray-600">Logged in as: {userEmail}</p>
              <div className="bg-gray-100 rounded-lg w-full p-4 mb-6 text-center">
                <span className="text-2xl tracking-widest">
                  {"●".repeat(pin.length).padEnd(4, "○")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleInput(num)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 rounded-lg shadow transition-colors duration-200 active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleClear}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-lg shadow transition-colors duration-200 active:scale-95"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleInput(0)}
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 rounded-lg shadow transition-colors duration-200 active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg shadow transition-colors duration-200 active:scale-95"
                >
                  Enter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
