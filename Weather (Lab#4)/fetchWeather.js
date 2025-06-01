async function fetchWeatherDataByCity(city = "Kyiv") {
  const apiKey = '3a5f074f8143ddde486e46a8c202f8ea';
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(forecastUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data by city");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

window.fetchWeatherDataByCity = fetchWeatherDataByCity;

async function fetchWeatherDataByCoords(lat, lon) {
  const apiKey = '3a5f074f8143ddde486e46a8c202f8ea';
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(forecastUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data by coordinates");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

window.fetchWeatherDataByCoords = fetchWeatherDataByCoords;