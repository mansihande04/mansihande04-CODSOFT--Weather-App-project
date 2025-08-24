// Function: Get weather by city name
async function getWeatherByCity() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
  const geoData = await geoRes.json();

  if (!geoData.results) {
    document.getElementById("weatherInfo").innerHTML = `<p>City not found!</p>`;
    return;
  }

  const lat = geoData.results[0].latitude;
  const lon = geoData.results[0].longitude;
  const name = geoData.results[0].name;

  fetchWeather(lat, lon, name);
}

// Function: Get weather by current location
function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        fetchWeather(position.coords.latitude, position.coords.longitude, "Your Location");
      },
      () => alert("Unable to retrieve your location.")
    );
  } else {
    alert("Geolocation not supported!");
  }
}

// Function: Fetch weather data
async function fetchWeather(lat, lon, placeName) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  const response = await fetch(url);
  const data = await response.json();

  // Current Weather
  const weather = data.current_weather;
  const icon = getWeatherIcon(weather.weathercode);
  setBackground(weather.weathercode);

  const weatherHTML = `
    <h2>${placeName}</h2>
    <div class="weather-icon">${icon}</div>
    <p>🌡 Temperature: ${weather.temperature}°C</p>
    <p>💨 Wind: ${weather.windspeed} km/h</p>
    <p>🧭 Wind Direction: ${weather.winddirection}°</p>
    <p>⏱ Time: ${weather.time}</p>
  `;
  document.getElementById("weatherInfo").innerHTML = weatherHTML;

  // Weekly Forecast
  let forecastHTML = "";
  data.daily.time.forEach((day, i) => {
    if (i < 7) {
      const dayIcon = getWeatherIcon(data.daily.weathercode[i]);
      forecastHTML += `
        <div class="forecast-day">
          <h3>${new Date(day).toLocaleDateString("en-US", { weekday: "short" })}</h3>
          <div>${dayIcon}</div>
          <p>🌡 ${data.daily.temperature_2m_min[i]}°C - ${data.daily.temperature_2m_max[i]}°C</p>
        </div>
      `;
    }
  });
  document.getElementById("forecast").innerHTML = forecastHTML;
}

// Function: Map weather codes to icons
function getWeatherIcon(code) {
  if (code === 0) return "☀️"; // Clear
  if ([1, 2].includes(code)) return "⛅"; // Partly Cloudy
  if (code === 3) return "☁️"; // Cloudy
  if ([45, 48].includes(code)) return "🌫️"; // Fog
  if ([51, 61, 80].includes(code)) return "🌦"; // Light Rain
  if ([53, 63, 81].includes(code)) return "🌧"; // Moderate Rain
  if ([55, 65, 82].includes(code)) return "⛈"; // Heavy Rain
  if ([71, 73, 75, 77].includes(code)) return "❄️"; // Snow
  if ([95, 96, 99].includes(code)) return "🌩"; // Thunderstorm
  return "🌍"; // Default
}

// Function: Change background dynamically
function setBackground(code) {
  let body = document.body;
  body.className = ""; // reset
  if (code === 0) body.classList.add("sunny");
  else if ([1, 2, 3].includes(code)) body.classList.add("cloudy");
  else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) body.classList.add("rainy");
  else if ([71, 73, 75, 77].includes(code)) body.classList.add("snowy");
  else if ([95, 96, 99].includes(code)) body.classList.add("stormy");
}


