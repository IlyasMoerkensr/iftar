import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get IP info using ipinfo.io
    const ipResponse = await axios.get("https://ipinfo.io/json", {
      headers: {
        Accept: "application/json",
      },
    });

    const { city, country, loc } = ipResponse.data;
    const [latitude, longitude] = loc.split(",");

    return NextResponse.json({
      city,
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
