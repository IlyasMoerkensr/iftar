import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Use OpenStreetMap Nominatim API for reverse geocoding
    // This is free and doesn't require an API key
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Iftar Countdown App/1.0",
          "Accept-Language": "en", // Request English results
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract city and country from the response
    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.hamlet ||
      data.address.suburb ||
      data.address.county ||
      "Unknown City";

    const country = data.address.country || "Unknown Country";

    return NextResponse.json({
      city,
      country,
      display_name: data.display_name,
      latitude,
      longitude,
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to reverse geocode coordinates" },
      { status: 500 }
    );
  }
}
