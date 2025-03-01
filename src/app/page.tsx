"use client";

import CountdownTimer from "@/components/CountdownTimer";
import Decorations from "@/components/Decorations";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Step 1: Get user's location based on IP
        const locationResponse = await axios.get("/api/location");
        const location = locationResponse.data;
        setLocationData(location);

        // Step 2: Get prayer times based on location
        const prayerResponse = await axios.get("/api/prayer-times", {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });

        // Maghrib time is Iftar time
        const maghribTime = prayerResponse.data.maghrib;
        setIftarTime(maghribTime);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load Iftar time. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-4 relative">
      {/* Decorative elements */}
      <Decorations />

      {/* Main content */}
      <div className="z-10 max-w-4xl w-full mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
          Iftar Countdown
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin h-16 w-16 border-4 border-primary rounded-full border-t-transparent"></div>
            <p className="mt-6 text-xl">
              Locating you and calculating Iftar time...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 p-6 rounded-lg text-center">
            <p className="text-xl text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-opacity-80 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          locationData &&
          iftarTime && (
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-800">
              <CountdownTimer
                iftarTime={iftarTime}
                city={locationData.city}
                country={locationData.country}
              />
            </div>
          )
        )}

        <footer className="mt-16 text-center text-gray-400 text-sm">
          <p>Remember to make dua before breaking your fast.</p>
          <p className="mt-2">
            اللَّهُمَّ إِنِّي لَكَ صُمْتُ، وَبِكَ آمَنْتُ، وَعَلَيْكَ
            تَوَكَّلْتُ، وَعَلَى رِزْقِكَ أَفْطَرْتُ
          </p>
          <p className="mt-1 text-xs">
            "O Allah, I fasted for You and I believe in You and I put my trust
            in You and I break my fast with Your sustenance."
          </p>
        </footer>
      </div>
    </div>
  );
}
