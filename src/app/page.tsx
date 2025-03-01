"use client";

import CountdownTimer from "@/components/CountdownTimer";
import Decorations from "@/components/Decorations";
import QuranPlayer from "@/components/QuranPlayer";
import SocialMetaTags from "@/components/SocialMetaTags";
import { useAnalytics } from "@/hooks/useAnalytics";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<{
    city: string;
    country: string;
    latitude: string;
    longitude: string;
  } | null>(null);
  const [iftarTime, setIftarTime] = useState<string | null>(null);
  const [formattedIftarTime, setFormattedIftarTime] = useState<string | null>(
    null
  );
  const [manualLocation, setManualLocation] = useState<boolean>(false);
  const [manualCity, setManualCity] = useState<string>("");
  const [manualCountry, setManualCountry] = useState<string>("");
  const { trackLocationChange } = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user's location based on IP directly from client side
        const ipResponse = await axios.get("https://ipinfo.io/json", {
          headers: {
            Accept: "application/json",
          },
        });

        const { city, country, loc } = ipResponse.data;
        const [latitude, longitude] = loc.split(",");

        // Format location data properly
        const formattedLocation = {
          city: city ? formatLocationName(city) : "Unknown City",
          country: country ? getCountryName(country) : "Unknown Country",
          latitude,
          longitude,
        };

        setLocationData(formattedLocation);

        // Get prayer times based on location
        const prayerResponse = await axios.get("/api/prayer-times", {
          params: {
            latitude,
            longitude,
            method: 5, // Egyptian General Authority of Survey calculation method
          },
        });

        // Maghrib time is Iftar time
        const maghribTime = prayerResponse.data.maghrib;
        const formattedMaghribTime =
          prayerResponse.data.formatted?.maghrib || formatToAmPm(maghribTime);

        setIftarTime(maghribTime);
        setFormattedIftarTime(formattedMaghribTime);
        setLoading(false);

        // When location data is successfully fetched, track it
        if (formattedLocation) {
          trackLocationChange(
            formattedLocation.city,
            formattedLocation.country,
            "approximate"
          );
        }
      } catch (err) {
        console.error("Error in location detection:", err);
        setError("Failed to load Iftar time. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to format location names properly
  const formatLocationName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Function to convert country code to full name
  const getCountryName = (countryCode: string) => {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    try {
      return regionNames.of(countryCode) || countryCode;
    } catch (error) {
      console.error("Error fetching country name:", error);
      return countryCode;
    }
  };

  // Function to convert 24-hour time to AM/PM format
  const formatToAmPm = (time24: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualCity || !manualCountry) return;

    try {
      setLoading(true);

      // Use geocoding API to get coordinates
      const geocodeResponse = await axios.get(
        `/api/geocode?city=${manualCity}&country=${manualCountry}`
      );
      const { latitude, longitude } = geocodeResponse.data;

      // Get prayer times based on manual location
      const prayerResponse = await axios.get("/api/prayer-times", {
        params: {
          latitude,
          longitude,
          method: 5, // Egyptian General Authority of Survey calculation method
        },
      });

      // Update state with manual location
      setLocationData({
        city: formatLocationName(manualCity),
        country: manualCountry,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });

      // Maghrib time is Iftar time
      const maghribTime = prayerResponse.data.maghrib;
      const formattedMaghribTime =
        prayerResponse.data.formatted?.maghrib || formatToAmPm(maghribTime);

      setIftarTime(maghribTime);
      setFormattedIftarTime(formattedMaghribTime);

      setLoading(false);
      setManualLocation(false);

      // Track the manual location change
      trackLocationChange(
        formatLocationName(manualCity),
        manualCountry,
        "manual"
      );
    } catch (err) {
      console.error("Error with manual location:", err);
      setError("Failed to get Iftar time for the specified location.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <SocialMetaTags />
      <Decorations />
      <QuranPlayer autoPlay={true} />

      <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center relative z-10">
        <div className="z-10 max-w-4xl w-full mx-auto flex flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Iftar Countdown
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Know exactly when to break your fast based on your location
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800/50 shadow-xl w-full max-w-lg">
              <div className="animate-spin h-16 w-16 border-4 border-primary rounded-full border-t-transparent"></div>
              <p className="mt-6 text-xl">
                Detecting your location and calculating Iftar time...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 p-8 rounded-2xl text-center border border-red-800/50 shadow-xl w-full max-w-lg">
              <p className="text-xl text-red-300 mb-4">{error}</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-primary text-white rounded-full hover:bg-opacity-80 transition-all shadow-lg"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setManualLocation(true)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-all shadow-lg"
                >
                  Enter Location Manually
                </button>
              </div>
            </div>
          ) : manualLocation ? (
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-6 text-center text-secondary">
                Enter Your Location
              </h2>
              <form onSubmit={handleManualLocationSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none"
                    placeholder="Enter city name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={manualCountry}
                    onChange={(e) => setManualCountry(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none"
                    placeholder="Enter country name"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setManualLocation(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-full hover:bg-opacity-80 transition-all"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          ) : (
            locationData &&
            iftarTime && (
              <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-lg transform hover:scale-[1.02] transition-all duration-300">
                <CountdownTimer
                  iftarTime={iftarTime}
                  city={locationData.city}
                  country={locationData.country}
                  formattedIftarTime={
                    formattedIftarTime || formatToAmPm(iftarTime)
                  }
                />
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setManualLocation(true)}
                    className="text-sm text-gray-400 hover:text-accent transition-colors flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Change Location
                  </button>
                </div>
              </div>
            )
          )}

          <footer className="mt-16 text-center text-gray-400 text-sm max-w-lg">
            <div className="p-4 rounded-xl bg-gray-900/30 backdrop-blur-sm border border-gray-800/30">
              <p className="mb-2">
                Remember to make dua before breaking your fast.
              </p>
              <p className="mt-2 text-accent font-medium">
                اللَّهُمَّ إِنِّي لَكَ صُمْتُ، وَبِكَ آمَنْتُ، وَعَلَيْكَ
                تَوَكَّلْتُ، وَعَلَى رِزْقِكَ أَفْطَرْتُ
              </p>
              <p className="mt-2 text-xs">
                &quot;O Allah, I fasted for You and I believe in You and I put
                my trust in You and I break my fast with Your sustenance.&quot;
              </p>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              © {new Date().getFullYear()} Iftar Countdown App
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
