import React, { useEffect, useState } from "react";

const Decorations: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate random stars with different properties
  const generateStars = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 4 + 2;
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 5;
      const opacity = Math.random() * 0.5 + 0.3;

      return (
        <div
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `${top}%`,
            left: `${left}%`,
            opacity,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${animationDelay}s`,
          }}
        ></div>
      );
    });
  };

  // Generate random clouds
  const generateClouds = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 100 + 50;
      const top = Math.random() * 40; // Keep clouds in the upper part
      const left = Math.random() * 100;
      const opacity = Math.random() * 0.1 + 0.05;
      const animationDuration = Math.random() * 100 + 150;

      return (
        <div
          key={i}
          className="absolute rounded-full bg-gray-300 dark:bg-gray-600"
          style={{
            width: `${size}px`,
            height: `${size * 0.6}px`,
            top: `${top}%`,
            left: `${left}%`,
            opacity,
            animation: `float ${animationDuration}s linear infinite`,
            transform: `translateX(${Math.random() * 20 - 10}px)`,
          }}
        ></div>
      );
    });
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Moon */}
      <div className="absolute top-10 right-10 md:top-20 md:right-20">
        <div className="relative">
          <div
            className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-accent opacity-80 animate-float"
            style={{ animationDuration: "6s" }}
          ></div>
          <div
            className="absolute top-1 left-4 w-12 h-12 md:w-18 md:h-18 rounded-full bg-gray-900 opacity-80"
            style={{ animationDuration: "6s" }}
          ></div>
        </div>
      </div>

      {/* Stars */}
      {mounted && generateStars(30)}

      {/* Clouds */}
      {mounted && generateClouds(5)}

      {/* Decorative mosque silhouette at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="w-full h-32 md:h-48 opacity-20">
          <svg
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M0,300 L0,200 L50,200 L75,150 L100,200 L150,200 L175,100 L200,200 L250,200 L275,150 L300,200 L350,200 L400,200 L425,100 L450,200 L500,200 L525,50 L550,200 L600,200 L650,200 L675,150 L700,200 L750,200 L775,100 L800,200 L850,200 L875,150 L900,200 L950,200 L1000,200 L1000,300 Z"
              fill="url(#mosqueGradient)"
            />
            <defs>
              <linearGradient
                id="mosqueGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#4ecdc4" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#ffd166" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Floating lanterns */}
      <div
        className="absolute top-1/4 left-10 opacity-60 animate-float"
        style={{ animationDuration: "8s" }}
      >
        <div className="w-8 h-12 bg-primary rounded-t-full relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-300 rounded-full"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <div
        className="absolute top-1/3 right-10 opacity-60 animate-float"
        style={{ animationDuration: "7s", animationDelay: "1s" }}
      >
        <div className="w-8 h-12 bg-secondary rounded-t-full relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-300 rounded-full"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <div
        className="absolute bottom-1/4 left-1/4 opacity-60 animate-float"
        style={{ animationDuration: "9s", animationDelay: "2s" }}
      >
        <div className="w-8 h-12 bg-accent rounded-t-full relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-300 rounded-full"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Light rays */}
      <div className="absolute top-0 left-0 right-0 h-screen overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-accent to-transparent transform rotate-12"></div>
        <div className="absolute top-0 left-1/3 w-2 h-full bg-gradient-to-b from-primary to-transparent transform -rotate-5"></div>
        <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-secondary to-transparent transform rotate-15"></div>
        <div className="absolute top-0 right-1/4 w-2 h-full bg-gradient-to-b from-accent to-transparent transform -rotate-10"></div>
      </div>
    </div>
  );
};

export default Decorations;
