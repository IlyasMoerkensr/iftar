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
  const [isIftar, setIsIftar] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!iftarTime) {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    // Parse the iftar time (format: HH:MM)
    const calculateTimeLeft = () => {
      const now = DateTime.now();

      // Parse iftar time (format: HH:MM)
      const [hours, minutes] = iftarTime.split(":").map(Number);

      // Create a DateTime object for today's iftar
      const iftarDateTime = now.set({
        hour: hours,
        minute: minutes,
        second: 0,
        millisecond: 0,
      });

      // If iftar time has already passed today, there's no countdown needed
      if (now > iftarDateTime) {
        setIsIftar(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      // Calculate the difference
      const diff = iftarDateTime
        .diff(now, ["hours", "minutes", "seconds"])
        .toObject();

      // Calculate progress percentage (inverse - starts at 100% and goes to 0%)
      const totalSecondsUntilIftar =
        (diff.hours || 0) * 3600 +
        (diff.minutes || 0) * 60 +
        (diff.seconds || 0);

      // Assuming a maximum of 16 hours for fasting (adjust as needed)
      const maxSeconds = 16 * 3600;
      const remainingPercentage = (totalSecondsUntilIftar / maxSeconds) * 100;
      setProgress(100 - Math.min(remainingPercentage, 100));

      return {
        hours: Math.floor(diff.hours || 0),
        minutes: Math.floor(diff.minutes || 0),
        seconds: Math.floor(diff.seconds || 0),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Check if it's iftar time
      if (
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        setIsIftar(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [iftarTime]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent"></div>
        <p className="mt-4 text-lg">Loading Iftar time...</p>
      </div>
    );
  }

  if (isIftar) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="w-24 h-24 mb-6 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#4ecdc4"
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset="0"
              className="animate-pulse"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="#ff6b6b"
              className="animate-pulse"
              style={{ animationDuration: "2s" }}
            />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-primary animate-pulse mb-4">
          It&apos;s Iftar Time!
        </h2>
        <p className="text-xl text-center">
          Enjoy your meal and may Allah accept your fast.
        </p>
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg text-center">
          <p className="text-accent">
            Iftar time in {city}, {country} is {formattedIftarTime}
          </p>
        </div>
      </div>
    );
  }

  // Calculate color based on time left
  const getTimeColor = () => {
    if (timeLeft.hours === 0) {
      if (timeLeft.minutes < 5) return "text-red-500";
      if (timeLeft.minutes < 30) return "text-primary";
      return "text-secondary";
    }
    return "text-accent";
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full mb-6 relative">
        <div className="flex justify-between text-xs text-gray-400 mb-1 px-1">
          <span>Fasting</span>
          <span>Iftar</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
            style={{
              width: `${progress}%`,
              transition: "width 1s ease-in-out",
            }}
          ></div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl mb-6 text-center">
        Time until Iftar in{" "}
        <span className="text-accent font-semibold">
          {city}, {country}
        </span>
      </h2>

      <div className="flex gap-4 md:gap-8">
        <div className="flex flex-col items-center">
          <div className="bg-gray-800/80 rounded-lg p-4 w-20 h-24 md:w-28 md:h-32 flex items-center justify-center shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span
              className={`text-4xl md:text-5xl font-bold ${getTimeColor()}`}
            >
              {timeLeft.hours.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="mt-2 text-sm md:text-base text-muted">HOURS</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-gray-800/80 rounded-lg p-4 w-20 h-24 md:w-28 md:h-32 flex items-center justify-center shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span
              className={`text-4xl md:text-5xl font-bold ${getTimeColor()}`}
            >
              {timeLeft.minutes.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="mt-2 text-sm md:text-base text-muted">MINUTES</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-gray-800/80 rounded-lg p-4 w-20 h-24 md:w-28 md:h-32 flex items-center justify-center shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-700/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span
              className={`text-4xl md:text-5xl font-bold ${getTimeColor()}`}
            >
              {timeLeft.seconds.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="mt-2 text-sm md:text-base text-muted">SECONDS</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-300">
          Iftar time:{" "}
          <span className="text-secondary font-medium">
            {formattedIftarTime}
          </span>
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;
