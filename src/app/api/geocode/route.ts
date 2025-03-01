import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const country = searchParams.get("country");

  if (!city || !country) {
    return NextResponse.json(
      { error: "City and country parameters are required" },
      { status: 400 }
    );
  }

  try {
    // Using OpenStreetMap Nominatim API for geocoding
    // This is a free service with usage limitations
    // For production, consider using a paid geocoding service
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          city,
          country,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "Iftar Countdown App",
          "Accept-Language": "en",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return NextResponse.json({
        latitude: location.lat,
        longitude: location.lon,
      });
    } else {
      // Fallback coordinates if location not found
      return NextResponse.json(
        {
          error: "Location not found",
          latitude: "21.4225",
          longitude: "39.8262",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error geocoding location:", error);
    // Fallback to Mecca coordinates as default
    return NextResponse.json(
      {
        error: "Failed to geocode location",
        latitude: "21.4225",
        longitude: "39.8262",
      },
      { status: 500 }
    );
  }
}
