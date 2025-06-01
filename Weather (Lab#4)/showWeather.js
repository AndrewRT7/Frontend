const { useState, useEffect } = React;

function WeatherWidget() {
  const [city, setCity] = useState("Kyiv");
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDataByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.fetchWeatherDataByCoords(lat, lon);
      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataByCity = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await window.fetchWeatherDataByCity(city);
      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  }, []);

  const handleGeolocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });
        fetchDataByCoords(lat, lon);
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        setError("Unable to retrieve your location");
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchDataByCity();
  };

  const forecastsByDate = weather && weather.list
  ? weather.list.reduce((acc, entry) => {
      const date = entry.dt_txt.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {})
  : {};

  return (
    <div className="weather-app">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={loading}
          placeholder="Enter city"/>
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </form>
      <button onClick={handleGeolocation} disabled={loading}>
        {loading ? "Loading..." : "Use My Location"}
      </button>

      {error && <div className="error">Error: {error}</div>}
      {weather && !loading && !error && (
        <div className="weather-widget">
        <h2>Weather Forecast: {weather.city.name}</h2>
        {Object.entries(forecastsByDate).map(([date, entries]) => (
          <div key={date}>
            <h3>{date}</h3>
            <ul>
              {entries.map((entry, idx) => (
                <li key={idx}>
                  <strong>{entry.dt_txt.split(' ')[1]}</strong> - {entry.main.temp}°C, {entry.weather[0].description}
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}

window.WeatherWidget = WeatherWidget;