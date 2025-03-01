import axios from "axios";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";

// Function to convert 24-hour time to AM/PM format
const formatToAmPm = (time24: string): string => {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const method = searchParams.get("method") || "5"; // Default to Egyptian General Authority of Survey (5)

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
          method: parseInt(method), // Use the method from the request or default to Egyptian method
          /*
            Available calculation methods:
            1 - University of Islamic Sciences, Karachi
            2 - Islamic Society of North America
            3 - Muslim World League
            4 - Umm Al-Qura University, Makkah
            5 - Egyptian General Authority of Survey
            7 - Institute of Geophysics, University of Tehran
            8 - Gulf Region
            9 - Kuwait
            10 - Qatar
            11 - Majlis Ugama Islam Singapura, Singapore
            12 - Union Organization Islamic de France
            13 - Diyanet İşleri Başkanlığı, Turkey
            14 - Spiritual Administration of Muslims of Russia
            15 - Moonsighting Committee Worldwide
          */
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
      // Include formatted times
      formatted: {
        fajr: formatToAmPm(timings.Fajr),
        sunrise: formatToAmPm(timings.Sunrise),
        dhuhr: formatToAmPm(timings.Dhuhr),
        asr: formatToAmPm(timings.Asr),
        maghrib: formatToAmPm(timings.Maghrib),
        isha: formatToAmPm(timings.Isha),
      },
    });
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return NextResponse.json(
      { error: "Failed to fetch prayer times" },
      { status: 500 }
    );
  }
}
