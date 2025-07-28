import { NextRequest, NextResponse } from "next/server";

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const GEOCODING_URL = "http://api.openweathermap.org/geo/1.0/direct";
const CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

export const runtime = "edge";

const MAX_FORECAST_HOURS = 5;
const DAILY_HOURS = 8;

function formatTime(hour: number): string {
  const amPm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour} ${amPm}`;
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (!city || typeof city !== "string") {
    return NextResponse.json(
      {
        message: 'Query parameter "city" is required and must be a string.',
      },
      { status: 400 }
    );
  }

  if (!OPENWEATHERMAP_API_KEY) {
    console.error("Missing OpenWeatherMap API key in environment variables.");
    return NextResponse.json(
      { message: "OpenWeatherMap API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const geoUrl = `${GEOCODING_URL}?q=${encodeURIComponent(
      city
    )}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`;
    const geoData = await fetchJson(geoUrl);

    if (!geoData?.length) {
      return NextResponse.json({ message: "City not found." }, { status: 404 });
    }

    const { name: cityName, lat, lon } = geoData[0];

    const [currentWeatherData, forecastData] = await Promise.all([
      fetchJson(
        `${CURRENT_WEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`
      ),
      fetchJson(
        `${FORECAST_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHERMAP_API_KEY}`
      ),
    ]);

    const hourly = forecastData.list.slice(0, MAX_FORECAST_HOURS).map((hour: any) => ({
      time: formatTime(new Date(hour.dt * 1000).getHours()),
      temperature: Math.round(hour.main.temp),
      weather: hour.weather[0].main,
      icon: hour.weather[0].icon,
    }));

    const firstDayTemps = forecastData.list.slice(0, DAILY_HOURS);
    const maxTemp = Math.round(Math.max(...firstDayTemps.map((h: any) => h.main.temp_max)));
    const minTemp = Math.round(Math.min(...firstDayTemps.map((h: any) => h.main.temp_min)));

    const data = {
      city: cityName,
      current: {
        temperature: Math.round(currentWeatherData.main.temp),
        weather: currentWeatherData.weather[0].main,
        description: currentWeatherData.weather[0].description,
        icon: currentWeatherData.weather[0].icon,
      },
      hourly,
      daily: {
        maxTemp,
        minTemp,
      },
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
