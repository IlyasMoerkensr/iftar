"use client";

import { useEffect, useRef, useState } from "react";

// List of Quran recitations with metadata
const quranRecitations = [
  {
    id: 1,
    surah: "Al-Fatiha",
    reciter: "Mishary Rashid Alafasy",
    url: "https://server8.mp3quran.net/afs/001.mp3",
  },
  {
    id: 2,
    surah: "Al-Baqarah (verses 1-10)",
    reciter: "Mishary Rashid Alafasy",
    url: "https://server8.mp3quran.net/afs/002.mp3",
  },
  {
    id: 3,
    surah: "Ar-Rahman",
    reciter: "Mishary Rashid Alafasy",
    url: "https://server8.mp3quran.net/afs/055.mp3",
  },
  {
    id: 4,
    surah: "Ya-Sin",
    reciter: "Mishary Rashid Alafasy",
    url: "https://server8.mp3quran.net/afs/036.mp3",
  },
  {
    id: 5,
    surah: "Al-Mulk",
    reciter: "Mishary Rashid Alafasy",
    url: "https://server8.mp3quran.net/afs/067.mp3",
  },
  {
    id: 6,
    surah: "Al-Kahf",
    reciter: "Mishary Rashid Alafasy",
    url: "https://server8.mp3quran.net/afs/018.mp3",
  },
  {
    id: 7,
    surah: "Ad-Duha",
    reciter: "Mishary Rashid Alafasy",
    url: "https://server8.mp3quran.net/afs/093.mp3",
  },
  {
    id: 8,
    surah: "Al-Ikhlas",
    reciter: "Mishary Rashid Alafasy",
    url: "https://server8.mp3quran.net/afs/112.mp3",
  },
];

interface QuranPlayerProps {
  autoPlay?: boolean;
}

export default function QuranPlayer({ autoPlay = true }: QuranPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecitation, setCurrentRecitation] = useState(
    quranRecitations[0]
  );
  const [volume, setVolume] = useState(0.02); // Lower default volume to 2%
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to play a random recitation
  const playRandomRecitation = () => {
    const randomIndex = Math.floor(Math.random() * quranRecitations.length);
    setCurrentRecitation(quranRecitations[randomIndex]);

    if (audioRef.current) {
      // Set the new source
      audioRef.current.src = quranRecitations[randomIndex].url;
      audioRef.current.volume = volume;

      // Play after a short delay to ensure the source is loaded
      setTimeout(() => {
        audioRef.current?.play().catch((err) => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
        });
      }, 100);

      setIsPlaying(true);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err);
        });
        setIsPlaying(true);
      }

      // If this is the first play, initialize with a random recitation
      if (
        !audioRef.current.src ||
        audioRef.current.src === window.location.href
      ) {
        playRandomRecitation();
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Play next recitation
  const playNext = () => {
    const currentIndex = quranRecitations.findIndex(
      (r) => r.id === currentRecitation.id
    );
    const nextIndex = (currentIndex + 1) % quranRecitations.length;
    setCurrentRecitation(quranRecitations[nextIndex]);

    if (audioRef.current) {
      audioRef.current.src = quranRecitations[nextIndex].url;
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err);
      });
      setIsPlaying(true);
    }
  };

  // Handle end of audio
  useEffect(() => {
    const handleEnded = () => {
      playNext();
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("ended", handleEnded);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded);
      }
    };
  }, [currentRecitation]);

  // Initialize audio on component mount and auto-play
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    // Auto-play on first load
    if (autoPlay && !isInitialized) {
      setIsInitialized(true);

      // We need to wait for user interaction before playing audio
      // This is a workaround for browsers that block autoplay
      const handleFirstInteraction = () => {
        if (!isPlaying && audioRef.current) {
          playRandomRecitation();

          // Remove the event listeners after first interaction
          document.removeEventListener("click", handleFirstInteraction);
          document.removeEventListener("touchstart", handleFirstInteraction);
          document.removeEventListener("keydown", handleFirstInteraction);
        }
      };

      // Add event listeners for user interaction
      document.addEventListener("click", handleFirstInteraction);
      document.addEventListener("touchstart", handleFirstInteraction);
      document.addEventListener("keydown", handleFirstInteraction);

      // Try to play immediately (will work on some browsers/conditions)
      setTimeout(() => {
        if (audioRef.current && !isPlaying) {
          playRandomRecitation();
        }
      }, 1000);

      // Return cleanup function
      return () => {
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("touchstart", handleFirstInteraction);
        document.removeEventListener("keydown", handleFirstInteraction);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Position the player in a fixed position at the bottom right
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Expanded controls - always visible */}
      <div className="bg-gray-900/90 backdrop-blur-md p-4 rounded-xl border border-gray-700 shadow-2xl w-72 transition-all duration-300">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-medium">Quran Player</h3>
          {/* Removed the close button since we want it always visible */}
        </div>

        <div className="mb-3">
          <p className="text-accent text-sm font-medium truncate">
            {currentRecitation.surah}
          </p>
          <p className="text-gray-400 text-xs truncate">
            {currentRecitation.reciter}
          </p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <button
            onClick={playRandomRecitation}
            className="text-gray-300 hover:text-white p-2"
            title="Random Surah"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="bg-primary hover:bg-primary/80 text-white p-3 rounded-full"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={playNext}
            className="text-gray-300 hover:text-white p-2"
            title="Next Surah"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full mx-2 accent-primary"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
