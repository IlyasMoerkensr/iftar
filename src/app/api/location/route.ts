import axios from "axios";
import { NextResponse } from "next/server";

// Function to format location names properly
const formatLocationName = (name: string) => {
  if (!name) return "Unknown";

  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export async function GET() {
  try {
    // Get IP info using ipinfo.io
    const ipResponse = await axios.get("https://ipinfo.io/json", {
      headers: {
        Accept: "application/json",
      },
    });

    const { city, country, loc } = ipResponse.data;
    const [latitude, longitude] = loc.split(",");

    // Format the city name properly
    const formattedCity = formatLocationName(city);

    return NextResponse.json({
      city: formattedCity,
      country,
      latitude,
      longitude,
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location data" },
      { status: 500 }
    );
  }
}
