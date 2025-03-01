import React from "react";

const Decorations: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Moon */}
      <div className="absolute top-10 right-10 md:top-20 md:right-20">
        <div
          className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-accent opacity-80 animate-float"
          style={{ animationDuration: "6s" }}
        ></div>
      </div>

      {/* Stars */}
      {Array.from({ length: 20 }).map((_, i) => {
        const size = Math.random() * 4 + 2;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const animationDelay = Math.random() * 5;

        return (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${top}%`,
              left: `${left}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${animationDelay}s`,
            }}
          ></div>
        );
      })}

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
              fill="#4ecdc4"
            />
          </svg>
        </div>
      </div>

      {/* Floating lanterns */}
      <div
        className="absolute top-1/4 left-10 w-8 h-12 bg-primary rounded-t-full opacity-60 animate-float"
        style={{ animationDuration: "8s" }}
      ></div>
      <div
        className="absolute top-1/3 right-10 w-8 h-12 bg-secondary rounded-t-full opacity-60 animate-float"
        style={{ animationDuration: "7s", animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-1/4 left-1/4 w-8 h-12 bg-accent rounded-t-full opacity-60 animate-float"
        style={{ animationDuration: "9s", animationDelay: "2s" }}
      ></div>
    </div>
  );
};

export default Decorations;
