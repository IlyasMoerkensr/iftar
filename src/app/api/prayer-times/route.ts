import axios from "axios";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const today = DateTime.now().toFormat("dd-MM-yyyy");

    // Using the Aladhan API to get prayer times
    const prayerResponse = await axios.get(
      `https://api.aladhan.com/v1/timings/${today}`,
      {
        params: {
          latitude,
          longitude,
          method: 2, // Islamic Society of North America
        },
      }
    );

    const { data } = prayerResponse.data;
    const { timings } = data;

    return NextResponse.json({
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib, // This is Iftar time
      isha: timings.Isha,
    });
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return NextResponse.json(
      { error: "Failed to fetch prayer times" },
      { status: 500 }
    );
  }
}
