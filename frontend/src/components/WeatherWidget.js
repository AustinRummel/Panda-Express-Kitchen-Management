/**
 * @module Frontend/Kiosk
 */
import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * WeatherWidget component.
 * 
 * @description A React functional component that displays the current weather information for a fixed location (College Station).
 * The widget fetches weather data from the OpenWeatherMap API and shows temperature, weather description, and an icon.
 * The widget is displayed as a fixed-position box at the bottom left of the screen.
 * 
 * @memberof module:Frontend/Kiosk
 * @returns {JSX.Element} A styled div containing the weather information and an icon.
 */
const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const location = "College Station"; // Fixed city

  const API_KEY = "93ebd5f142bedb95d9b7be09a41d0897";
  const API_URL = `https://api.openweathermap.org/data/2.5/weather`;

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await axios.get(API_URL, {
        params: {
          q: location,
          appid: API_KEY,
          units: "imperial", // Fahrenheit
        },
      });
      setWeather(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeather(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        width: "220px",
        height: "100px",
        backgroundColor: "#fff",
        border: "2px solid #d3212d",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "row", // Change to row to accommodate image and text side by side
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        padding: "10px",
      }}
    >
      {weather ? (
        <>
          {/* Weather Icon */}
          <img
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather Icon"
            style={{ width: "60px", height: "60px", marginRight: "10px" }}
          />

          {/* Weather Information */}
          <div style={{ fontSize: "14px", textAlign: "left" }}>
            <p
              style={{
                fontWeight: "bold",
                margin: "4px 0",
                color: "#333",
              }}
            >
              {location}
            </p>
            <p
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#d3212d",
                margin: "4px 0",
              }}
            >
              {Math.round(weather.main.temp)}°F
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#555",
                margin: "4px 0",
                textTransform: "capitalize",
              }}
            >
              {weather.weather[0].description}
            </p>
          </div>
        </>
      ) : (
        <p style={{ fontSize: "12px", color: "#d3212d" }}>
          Fetching weather...
        </p>
      )}
    </div>
  );
};

export default WeatherWidget;
