import { useEffect, useState } from 'react';

export default function Loader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* 3D Orbiting system */}
        <div className="relative w-48 h-48 transform-3d">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full animate-[spin-slow_10s_linear_infinite]" />
          
          {/* Middle rotating ring */}
          <div className="absolute inset-4 border-2 border-cyan-400/30 rounded-full animate-[spin-slow_7s_linear_infinite_reverse]" />
          
          {/* Inner rotating ring */}
          <div className="absolute inset-8 border-2 border-purple-500/20 rounded-full animate-[spin-slow_5s_linear_infinite]" />

          {/* Orbiting particles */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 -ml-2 -mt-2"
                style={{
                  animation: `orbit ${3 + i * 0.2}s linear infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div 
                  className="w-4 h-4 rounded-full shadow-lg shadow-blue-500/50"
                  style={{
                    background: `linear-gradient(135deg, 
                      hsl(${217 + i * 10}, 91%, 60%), 
                      hsl(${189 + i * 10}, 94%, 43%))`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Central glowing core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full pulse-glow" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full animate-ping opacity-30" />
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="mt-16 w-80">
          {/* Progress bar with shimmer effect */}
          <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          
          {/* Loading text */}
          <div className="mt-4 text-center space-y-2">
            <p className="text-slate-300 text-lg font-semibold">
              Initializing Student Portal
            </p>
            <p className="text-blue-400 text-2xl font-bold animate-pulse">
              {progress}%
            </p>
          </div>

          {/* Loading dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full"
                style={{
                  animation: `float 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
