import { useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/hooks/useStore";

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const { user } = useStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.onboardingComplete) {
        setLocation("/");
      } else {
        setLocation("/welcome");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [setLocation, user]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center max-w-[480px] mx-auto app-frame"
      style={{ backgroundColor: "hsl(var(--header-bg))" }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--gold)/0.12) 0%, transparent 70%)",
        }}
      />

      <div className="text-center animate-in fade-in zoom-in duration-700 relative z-10">
        {/* Geometric ornament */}
        <div
          className="text-5xl mb-5 leading-none"
          style={{ color: "hsl(var(--nav-active))" }}
        >
          ✦
        </div>

        <h1
          className="text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg"
          style={{ color: "hsl(var(--header-fg))" }}
        >
          مواعيدك
        </h1>

        {/* Gold divider */}
        <div className="gold-divider my-3 w-40 mx-auto" />

        <p
          className="text-base font-medium tracking-wide"
          style={{ color: "hsl(var(--header-fg-muted))" }}
        >
          كل موعد له وقته
        </p>
      </div>
    </div>
  );
}
