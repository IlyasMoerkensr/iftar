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

  // Fetch Fajr time when component mounts
  useEffect(() => {
    const fetchFajrTime = async () => {
      try {
        setIsLoading(true);
        if (!city || !country) return;

        try {
          // Get user's location based on IP directly from client side
          const ipResponse = await axios.get("https://ipinfo.io/json", {
            headers: {
              Accept: "application/json",
            },
          });

          const { loc } = ipResponse.data;
          const [latitude, longitude] = loc.split(",");

          const prayerResponse = await axios.get("/api/prayer-times", {
            params: {
              latitude,
              longitude,
              method: 5, // Egyptian General Authority of Survey calculation method
            },
          });

          const fajrTime = prayerResponse.data.fajr;
          const formattedFajrTime =
            prayerResponse.data.formatted?.fajr || formatToAmPm(fajrTime);

          setFajrTime(fajrTime);
          setFormattedFajrTime(formattedFajrTime);

          // Determine which prayer to show based on current time
          if (!manualToggle) {
            checkCurrentPrayer(iftarTime, fajrTime);
          }

          setIsLoading(false);
        } catch (ipError) {
          console.error("Error fetching IP location:", ipError);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching Fajr time:", err);
        setIsLoading(false);
      }
    };

    fetchFajrTime();
  }, [city, country, iftarTime, manualToggle]);

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
        setCelebrationMessage("It's Iftar Time!");
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
      setCelebrationMessage("It's Fajr Time!");
      setCelebrationVisible(true);
      setTimeout(() => setCelebrationVisible(false), 5000);
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

      // Determine which prayer time to count down to
      if (currentPrayer === "iftar") {
        // Calculate countdown to Iftar
        const [iftarHours, iftarMinutes] = iftarTime.split(":").map(Number);
        const iftarDateTime = now.set({
          hour: iftarHours,
          minute: iftarMinutes,
          second: 0,
          millisecond: 0,
        });

        // If iftar time has already passed today, use tomorrow's iftar
        let targetIftarDateTime = iftarDateTime;
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
        } else if (now > iftarDateTime) {
          // If manually toggled to iftar but iftar has passed, show countdown to tomorrow's iftar
          targetIftarDateTime = iftarDateTime.plus({ days: 1 });
        }

        // Calculate the difference for Iftar countdown
        const diff = targetIftarDateTime
          .diff(now, ["hours", "minutes", "seconds"])
          .toObject();

        // For Iftar countdown, we want to show progress as time remaining until Iftar
        // Calculate progress as inverse of remaining time (100% - remaining percentage)
        const totalSecondsInDay = 24 * 60 * 60;
        const secondsUntilIftar =
          (diff.hours || 0) * 3600 +
          (diff.minutes || 0) * 60 +
          (diff.seconds || 0);

        // If it's a long time until Iftar (e.g., just after Fajr), the progress should be low
        // If it's close to Iftar time, the progress should be high
        const progressPercentage =
          100 - (secondsUntilIftar / totalSecondsInDay) * 100;
        setProgress(progressPercentage);

        return {
          hours: Math.floor(diff.hours || 0),
          minutes: Math.floor(diff.minutes || 0),
          seconds: Math.floor(diff.seconds || 0),
        };
      } else {
        // Calculate countdown to Fajr
        const [fajrHours, fajrMinutes] = fajrTime.split(":").map(Number);

        // Create a DateTime object for Fajr
        let fajrDateTime = now.set({
          hour: fajrHours,
          minute: fajrMinutes,
          second: 0,
          millisecond: 0,
        });

        // If Fajr time has already passed today, use tomorrow's Fajr
        if (now > fajrDateTime) {
          fajrDateTime = fajrDateTime.plus({ days: 1 });
        }

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

        // For Fajr countdown, calculate progress as inverse of remaining time
        const totalSecondsInNight = 12 * 60 * 60; // Approximate night duration
        const secondsUntilFajr =
          (diff.hours || 0) * 3600 +
          (diff.minutes || 0) * 60 +
          (diff.seconds || 0);

        // If it's a long time until Fajr (e.g., just after Iftar), the progress should be low
        // If it's close to Fajr time, the progress should be high
        const progressPercentage =
          100 - (secondsUntilFajr / totalSecondsInNight) * 100;
        setProgress(progressPercentage);

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
        <p className="mt-6 text-xl">Loading prayer times...</p>
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
    // For a more intuitive display, show the percentage of time that has passed
    // rather than the raw progress calculation
    if (currentPrayer === "iftar") {
      const hoursInDay = 24;
      const hoursLeft =
        timeLeft.hours + timeLeft.minutes / 60 + timeLeft.seconds / 3600;
      const percentComplete = Math.round(
        ((hoursInDay - hoursLeft) / hoursInDay) * 100
      );
      return `${Math.min(Math.max(percentComplete, 0), 100)}%`;
    } else {
      const approxNightHours = 12;
      const hoursLeft =
        timeLeft.hours + timeLeft.minutes / 60 + timeLeft.seconds / 3600;
      const percentComplete = Math.round(
        ((approxNightHours - hoursLeft) / approxNightHours) * 100
      );
      return `${Math.min(Math.max(percentComplete, 0), 100)}%`;
    }
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
                ? "Enjoy your meal and may Allah accept your fast."
                : "It's time for Suhoor and prayers."}
            </p>
          </div>
        </div>
      )}

      <div className="w-full mb-8 relative">
        <div className="flex justify-between text-sm mb-1 px-1">
          <span className="font-medium text-gray-400">Fajr</span>
          <span className="font-medium text-gray-300">
            {formatProgressPercentage()}
          </span>
          <span className="font-medium text-gray-400">Iftar</span>
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
        Time until{" "}
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
          <span className="mt-2 text-sm md:text-base text-gray-400">HOURS</span>
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
            MINUTES
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
            SECONDS
          </span>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-300 text-lg">
          {currentPrayer === "iftar" ? (
            <>
              Iftar time:{" "}
              <span className="text-amber-400 font-medium">
                {formattedIftarTime}
              </span>
            </>
          ) : (
            <>
              <span className="flex flex-col gap-1">
                <span>
                  Fajr time:{" "}
                  <span className="text-indigo-400 font-medium">
                    {formattedFajrTime}
                  </span>
                </span>
                <span className="text-sm text-gray-400">
                  Tomorrow&apos;s Iftar:{" "}
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
        Switch to {currentPrayer === "iftar" ? "Fajr" : "Iftar"} Countdown
      </button>
    </div>
  );
};

export default CountdownTimer;
