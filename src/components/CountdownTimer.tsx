import axios from "axios";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  iftarTime: string;
  city: string;
  country: string;
  formattedIftarTime: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  iftarTime,
  city,
  country,
  formattedIftarTime,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fajrTime, setFajrTime] = useState<string | null>(null);
  const [formattedFajrTime, setFormattedFajrTime] = useState<string | null>(
    null
  );
  const [currentPrayer, setCurrentPrayer] = useState<"iftar" | "fajr">("iftar");
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [manualToggle, setManualToggle] = useState(false);
  const [notified15Min, setNotified15Min] = useState(false);

  // Fetch Fajr time when component mounts
  useEffect(() => {
    const fetchFajrTime = async () => {
      try {
        setIsLoading(true);
        if (!city || !country) return;

        try {
          // Get user's GPS coordinates (they should already be available)
          const gpsCoordinates = await new Promise<{
            latitude: number;
            longitude: number;
          }>((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error("Geolocatie niet ondersteund"));
            }
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => reject(error)
            );
          });

          const prayerResponse = await axios.get("/api/prayer-times", {
            params: {
              latitude: gpsCoordinates.latitude,
              longitude: gpsCoordinates.longitude,
              method: 5, // Egyptian General Authority of Survey calculation method
            },
          });

          const fajrTime = prayerResponse.data.fajr;
          const formattedFajrTime = prayerResponse.data.formatted?.fajr || fajrTime;

          setFajrTime(fajrTime);
          setFormattedFajrTime(formattedFajrTime);

          // Determine which prayer to show based on current time
          if (!manualToggle) {
            checkCurrentPrayer(iftarTime, fajrTime);
          }

          setIsLoading(false);
        } catch (error) {
          console.error("Fout bij GPS-ophaling:", error);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Fout bij ophaling Fajrtijd:", err);
        setIsLoading(false);
      }
    };

    fetchFajrTime();
  }, [city, country, iftarTime, manualToggle]);

  // Ask for Notification permission on mount (best-effort)
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        Notification.requestPermission();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Helper to send a single 15-minute reminder notification
  const notifyIfNeeded = (remainingSeconds: number, prayerLabel: string) => {
    if (remainingSeconds <= 0) return;

    const remindThreshold = 15 * 60; // 15 minutes in seconds

    if (remainingSeconds <= remindThreshold && !notified15Min) {
      setNotified15Min(true);

      const title = `Bijna ${prayerLabel}`;
      const body = `Over 15 minuten is het ${prayerLabel.toLowerCase()}.`;

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(title, { body });
        } catch (e) {
          // ignore notification errors
        }
      } else {
        // Fallback: show in-app banner/overlay
        setCelebrationMessage(body);
        setCelebrationVisible(true);
        setTimeout(() => setCelebrationVisible(false), 7000);
      }
    } else if (remainingSeconds > remindThreshold && notified15Min) {
      // reset flag when we're sufficiently far from the target again
      setNotified15Min(false);
    }
  };

  // Function to determine which prayer countdown to show based on current time
  const checkCurrentPrayer = (
    iftarTimeStr: string,
    fajrTimeStr: string | null
  ) => {
    if (!fajrTimeStr) return;

    const now = DateTime.now();

    // Parse iftar time
    const [iftarHours, iftarMinutes] = iftarTimeStr.split(":").map(Number);
    const iftarDateTime = now.set({
      hour: iftarHours,
      minute: iftarMinutes,
      second: 0,
      millisecond: 0,
    });

    // Parse fajr time
    const [fajrHours, fajrMinutes] = fajrTimeStr.split(":").map(Number);
    let fajrDateTime = now.set({
      hour: fajrHours,
      minute: fajrMinutes,
      second: 0,
      millisecond: 0,
    });

    // If fajr time has already passed today, use tomorrow's fajr
    if (now > fajrDateTime) {
      fajrDateTime = fajrDateTime.plus({ days: 1 });
    }

    // Check if iftar time has passed
    const iftarPassed = now > iftarDateTime;

    // Check if we're between midnight and Fajr
    const isBeforeFajr =
      now.hour < fajrHours ||
      (now.hour === fajrHours && now.minute < fajrMinutes);

    // If iftar has passed, show fajr countdown
    if (iftarPassed) {
      setCurrentPrayer("fajr");

      // Show celebration for 5 seconds when iftar time just passed
      const justPassedIftar = now.diff(iftarDateTime, "minutes").minutes < 5;
      if (justPassedIftar) {
        setCelebrationMessage("Het is Iftartijd!");
        setCelebrationVisible(true);
        setTimeout(() => setCelebrationVisible(false), 5000);
      }
    } else if (isBeforeFajr) {
      // If we're after midnight but before Fajr, still show Fajr countdown
      setCurrentPrayer("fajr");
    } else {
      // Otherwise show Iftar countdown (after Fajr has passed for the day)
      setCurrentPrayer("iftar");
    }

    // Check if fajr time is very close or just passed
    const fajrDiff = fajrDateTime.diff(now, "minutes").minutes;
    const justPassedFajr = fajrDiff < 0 && fajrDiff > -5;

    if (justPassedFajr) {
      setCelebrationMessage("Het is Fajtijd!");
      setCelebrationVisible(true);
      setTimeout(() => setCelebrationVisible(false), 5000);
    }
  };

  useEffect(() => {
    if (!iftarTime || !fajrTime) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    const calculateTimeLeft = () => {
      const now = DateTime.now();

      // Parse fajr time to check if we're before fajr
      const [fajrHours, fajrMinutes] = fajrTime.split(":").map(Number);
      const isBeforeFajr =
        now.hour < fajrHours ||
        (now.hour === fajrHours && now.minute < fajrMinutes);

      // Parse iftar time
      const [iftarHours, iftarMinutes] = iftarTime.split(":").map(Number);

      // Create DateTime objects for both prayer times
      let fajrDateTime = now.set({
        hour: fajrHours,
        minute: fajrMinutes,
        second: 0,
        millisecond: 0,
      });

      let iftarDateTime = now.set({
        hour: iftarHours,
        minute: iftarMinutes,
        second: 0,
        millisecond: 0,
      });

      // Adjust dates if times have passed
      if (now > fajrDateTime) {
        fajrDateTime = fajrDateTime.plus({ days: 1 });
      }

      if (now > iftarDateTime) {
        iftarDateTime = iftarDateTime.plus({ days: 1 });
      }

      // Determine which prayer time to count down to
      if (currentPrayer === "iftar") {
        // Calculate countdown to Iftar
        // If iftar time has already passed today, use tomorrow's iftar
        const targetIftarDateTime = iftarDateTime;
        if (now > iftarDateTime && !manualToggle) {
          // Only auto-switch if not manually toggled
          setCurrentPrayer("fajr");

          // Show celebration message
          setCelebrationMessage("It's Iftar Time!");
          setCelebrationVisible(true);
          setTimeout(() => setCelebrationVisible(false), 5000);

          // Return empty time left, will be recalculated on next render with fajr
          return {
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        }

        // Calculate the difference for Iftar countdown
        const diff = targetIftarDateTime
          .diff(now, ["hours", "minutes", "seconds"])
          .toObject();

        // Notify 15 minutes before Iftar
        const remainingIftarSeconds = Math.round(
          targetIftarDateTime.diff(now, "seconds").as("seconds")
        );
        notifyIfNeeded(remainingIftarSeconds, "Iftar");

        // For Iftar countdown, calculate progress based on time elapsed since Fajr
        // First, calculate total duration from Fajr to Iftar
        const totalDuration = iftarDateTime.diff(fajrDateTime).as("seconds");
        const elapsedSinceFajr = now.diff(fajrDateTime).as("seconds");

        // If now is before fajr, we're in the previous day's cycle
        let progressPercentage;
        if (now < fajrDateTime) {
          // We're between yesterday's Iftar and today's Fajr
          // Use yesterday's Fajr to today's Iftar for total duration
          const yesterdayFajr = fajrDateTime.minus({ days: 1 });
          const totalCycleDuration = iftarDateTime
            .diff(yesterdayFajr)
            .as("seconds");
          const elapsedSinceYesterdayFajr = now
            .diff(yesterdayFajr)
            .as("seconds");
          progressPercentage =
            (elapsedSinceYesterdayFajr / totalCycleDuration) * 100;
        } else {
          // We're between today's Fajr and today's Iftar
          progressPercentage =
            (elapsedSinceFajr / Math.abs(totalDuration)) * 100;
        }

        // Ensure progress is between 0 and 100
        progressPercentage = Math.max(0, Math.min(100, progressPercentage));
        setProgress(progressPercentage);

        return {
          hours: Math.floor(diff.hours || 0),
          minutes: Math.floor(diff.minutes || 0),
          seconds: Math.floor(diff.seconds || 0),
        };
      } else {
        // Calculate countdown to Fajr
        // Calculate the difference
        const diff = fajrDateTime
          .diff(now, ["hours", "minutes", "seconds"])
          .toObject();

        // Check if Fajr time has just passed and we should switch to Iftar countdown
        // Only switch if we're not in the period between midnight and Fajr
        if (
          diff.hours === 0 &&
          diff.minutes === 0 &&
          diff.seconds === 0 &&
          !isBeforeFajr &&
          !manualToggle
        ) {
          setCurrentPrayer("iftar");

          // Show celebration message
          setCelebrationMessage("It's Fajr Time!");
          setCelebrationVisible(true);
          setTimeout(() => setCelebrationVisible(false), 5000);
        }

        // For Fajr countdown, calculate progress based on time elapsed since Iftar
        // First, calculate total duration from Iftar to Fajr
        const totalDuration = fajrDateTime.diff(iftarDateTime).as("seconds");
        const elapsedSinceIftar = now.diff(iftarDateTime).as("seconds");

        // If now is before iftar, we're in the previous day's cycle
        let progressPercentage;
        if (now < iftarDateTime) {
          // We're between yesterday's Iftar and today's Fajr
          const yesterdayIftar = iftarDateTime.minus({ days: 1 });
          const elapsedSinceYesterdayIftar = now
            .diff(yesterdayIftar)
            .as("seconds");
          const totalNightDuration = fajrDateTime
            .diff(yesterdayIftar)
            .as("seconds");
          progressPercentage =
            (elapsedSinceYesterdayIftar / totalNightDuration) * 100;
        } else {
          // We're between today's Iftar and tomorrow's Fajr
          progressPercentage =
            (elapsedSinceIftar / Math.abs(totalDuration)) * 100;
        }

        // Ensure progress is between 0 and 100
        progressPercentage = Math.max(0, Math.min(100, progressPercentage));
        setProgress(progressPercentage);

        // Notify 15 minutes before Fajr
        const remainingFajrSeconds = Math.round(fajrDateTime.diff(now, "seconds").as("seconds"));
        notifyIfNeeded(remainingFajrSeconds, "Fajr");

        return {
          hours: Math.floor(diff.hours || 0),
          minutes: Math.floor(diff.minutes || 0),
          seconds: Math.floor(diff.seconds || 0),
        };
      }
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Check if countdown reached zero
      if (
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        // The switching logic is now handled in calculateTimeLeft
        // to ensure proper conditions are checked
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [iftarTime, fajrTime, currentPrayer, manualToggle]);

  // Toggle between Iftar and Fajr countdown
  const togglePrayer = () => {
    setManualToggle(true);
    setCurrentPrayer(currentPrayer === "iftar" ? "fajr" : "iftar");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800/50 shadow-xl w-full">
        <div className="animate-spin h-16 w-16 border-4 border-primary rounded-full border-t-transparent"></div>
        <p className="mt-6 text-xl">Gebedstijden laden...</p>
      </div>
    );
  }

  // Calculate color based on time left
  const getTimeColor = () => {
    if (timeLeft.hours === 0) {
      if (timeLeft.minutes < 5) return "text-red-500";
      if (timeLeft.minutes < 30) return "text-primary";
      return currentPrayer === "iftar" ? "text-amber-400" : "text-indigo-400";
    }
    return currentPrayer === "iftar" ? "text-emerald-400" : "text-violet-400";
  };

  // Get gradient colors based on current prayer
  const getGradientClass = () => {
    return currentPrayer === "iftar"
      ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400"
      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600";
  };

  // Format the progress percentage for display
  const formatProgressPercentage = () => {
    return `${Math.round(progress)}%`;
  };

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Celebration overlay */}
      {celebrationVisible && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm rounded-xl animate-fade-in">
          <div className="text-center">
            <h2
              className="text-4xl font-bold animate-pulse mb-4"
              style={{
                color: currentPrayer === "iftar" ? "#10b981" : "#8b5cf6",
              }}
            >
              {celebrationMessage}
            </h2>
            <p className="text-xl text-white">
              {currentPrayer === "iftar"
                ? "Geniet van je maaltijd en moge Allah je vasten accepteren."
                : "Het is tijd voor Suhoor en het gebed."}
            </p>
          </div>
        </div>
      )}

      <div className="w-full mb-8 relative">
        <div className="flex justify-between text-sm mb-1 px-1">
          <span className="font-medium text-gray-400">
            {currentPrayer === "iftar" ? "Fajr" : "Iftar"}
          </span>
          <span className="font-medium text-gray-300">
            {formatProgressPercentage()}
          </span>
          <span className="font-medium text-gray-400">
            {currentPrayer === "iftar" ? "Iftar" : "Fajr"}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full ${getGradientClass()} shadow-lg`}
            style={{
              width: `${progress}%`,
              transition: "width 1s ease-in-out",
            }}
          ></div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl mb-8 text-center font-medium">
        Tijd tot{" "}
        <span
          className={
            currentPrayer === "iftar"
              ? "text-emerald-400 font-semibold"
              : "text-violet-400 font-semibold"
          }
        >
          {currentPrayer === "iftar" ? "Iftar" : "Fajr"}
        </span>{" "}
        in{" "}
        <span className="text-gray-300 font-semibold">
          {city}, {country}
        </span>
      </h2>

      <div className="flex gap-4 md:gap-8 mb-6">
        <div className="flex flex-col items-center">
          <div className="bg-gray-800/80 rounded-xl p-4 w-24 h-28 md:w-32 md:h-36 flex items-center justify-center shadow-lg relative overflow-hidden group border border-gray-700/30">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span
              className={`text-5xl md:text-6xl font-bold ${getTimeColor()}`}
            >
              {timeLeft.hours.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="mt-2 text-sm md:text-base text-gray-400">UREN</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-gray-800/80 rounded-xl p-4 w-24 h-28 md:w-32 md:h-36 flex items-center justify-center shadow-lg relative overflow-hidden group border border-gray-700/30">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span
              className={`text-5xl md:text-6xl font-bold ${getTimeColor()}`}
            >
              {timeLeft.minutes.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="mt-2 text-sm md:text-base text-gray-400">
            MINUTEN
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-gray-800/80 rounded-xl p-4 w-24 h-28 md:w-32 md:h-36 flex items-center justify-center shadow-lg relative overflow-hidden group border border-gray-700/30">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span
              className={`text-5xl md:text-6xl font-bold ${getTimeColor()}`}
            >
              {timeLeft.seconds.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="mt-2 text-sm md:text-base text-gray-400">
            SECONDEN
          </span>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-300 text-lg">
          {currentPrayer === "iftar" ? (
            <>
              Iftartijd:{" "}
              <span className="text-amber-400 font-medium">
                {formattedIftarTime}
              </span>
            </>
          ) : (
            <>
              <span className="flex flex-col gap-1">
                <span>
                  Fajtijd:{" "}
                  <span className="text-indigo-400 font-medium">
                    {formattedFajrTime}
                  </span>
                </span>
                <span className="text-sm text-gray-400">
                  Morgen Iftar:{" "}
                  <span className="text-amber-400">{formattedIftarTime}</span>
                </span>
              </span>
            </>
          )}
        </p>
      </div>

      {/* Toggle button */}
      <button
        onClick={togglePrayer}
        className="px-5 py-2 bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 rounded-full transition-all shadow-md text-sm border border-gray-700/30 flex items-center gap-2"
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        Schakel naar {currentPrayer === "iftar" ? "Fajr" : "Iftar"} aftellen
      </button>
    </div>
  );
};

export default CountdownTimer;
