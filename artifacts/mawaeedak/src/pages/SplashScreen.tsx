import { useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/hooks/useStore";

interface SplashScreenProps {
  onComplete?: () => void;
}

/**
 * SplashScreen — Saudi Premium Minimal Brand Screen
 * Reference: docs/design-reference/final-2026/01-brand-cover.jpeg
 * 
 * Features:
 * - Warm ivory background with soft sand gradient
 * - Centered premium circular logo/icon
 * - Arabic brand title: مواعيدك
 * - Premium tagline: رفيق يومك في كل موعد
 * - Lower text: راتبك، تقويمك، ومواعيدك
 * - Gold ornamental separators
 * - Desert dune visual at bottom
 * - Palm tree decorative motif
 * - 3-4 second auto-transition to Home
 */
export default function SplashScreen({ onComplete }: SplashScreenProps = {}) {
  const [, setLocation] = useLocation();
  const { user } = useStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasOnboarded = localStorage.getItem("mawaeedak_onboarded");
      
      if (onComplete) {
        onComplete();
        return;
      }

      try {
        sessionStorage.setItem("mawaeedak_splash_shown", "true");
      } catch {
        // Session storage is best effort.
      }
      
      if (hasOnboarded || user?.onboardingComplete) {
        setLocation("/");
      } else {
        setLocation("/welcome");
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [setLocation, user, onComplete]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center max-w-[480px] mx-auto overflow-hidden"
      style={{ 
        background: "linear-gradient(180deg, #FAF7F2 0%, #F5F0E6 35%, #F3E8D6 70%, #E8DCC8 100%)",
      }}
    >
      {/* Premium radial glow at center-top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 15%, rgba(201,160,99,0.22) 0%, transparent 60%)",
        }}
      />

      {/* Desert dune wave pattern at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none overflow-hidden"
      >
        <svg viewBox="0 0 480 120" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="duneGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(201,160,99,0.18)" />
              <stop offset="100%" stopColor="rgba(201,160,99,0.08)" />
            </linearGradient>
            <linearGradient id="duneGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(167,128,66,0.14)" />
              <stop offset="100%" stopColor="rgba(167,128,66,0.06)" />
            </linearGradient>
          </defs>
          {/* Back dune */}
          <path
            d="M0 120 L0 70 Q60 40 120 55 T240 45 T360 60 T480 50 L480 120 Z"
            fill="url(#duneGrad2)"
          />
          {/* Front dune */}
          <path
            d="M0 120 L0 85 Q80 55 160 70 T320 60 T480 75 L480 120 Z"
            fill="url(#duneGrad1)"
          />
          {/* Small sand ripples */}
          <path
            d="M0 120 L0 100 Q40 90 80 95 T160 92 T240 96 T320 93 T400 97 T480 94 L480 120 Z"
            fill="rgba(201,160,99,0.10)"
          />
        </svg>
      </div>

      {/* Palm tree decoration - left side */}
      <div className="absolute top-16 left-2 opacity-25 pointer-events-none">
        <svg width="50" height="90" viewBox="0 0 50 90" fill="none">
          <path d="M25 90 L25 45" stroke="#A78042" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M25 50 Q12 35 3 40 Q15 30 25 45" fill="#A78042" opacity="0.9"/>
          <path d="M25 50 Q38 35 47 40 Q35 30 25 45" fill="#A78042" opacity="0.9"/>
          <path d="M25 45 Q8 25 0 30 Q12 22 25 40" fill="#A78042" opacity="0.8"/>
          <path d="M25 45 Q42 25 50 30 Q38 22 25 40" fill="#A78042" opacity="0.8"/>
          <path d="M25 40 Q15 20 10 22 Q18 15 25 35" fill="#A78042" opacity="0.7"/>
          <path d="M25 40 Q35 20 40 22 Q32 15 25 35" fill="#A78042" opacity="0.7"/>
        </svg>
      </div>

      {/* Palm tree decoration - right side */}
      <div className="absolute top-24 right-3 opacity-20 pointer-events-none">
        <svg width="40" height="70" viewBox="0 0 40 70" fill="none">
          <path d="M20 70 L20 35" stroke="#C9A063" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 38 Q10 25 2 30 Q12 22 20 34" fill="#C9A063" opacity="0.9"/>
          <path d="M20 38 Q30 25 38 30 Q28 22 20 34" fill="#C9A063" opacity="0.9"/>
          <path d="M20 34 Q6 18 0 22 Q10 15 20 30" fill="#C9A063" opacity="0.7"/>
          <path d="M20 34 Q34 18 40 22 Q30 15 20 30" fill="#C9A063" opacity="0.7"/>
        </svg>
      </div>

      {/* Main content - centered premium composition */}
      <div className="text-center animate-in fade-in zoom-in duration-700 relative z-10 px-6">
        
        {/* Premium circular brand icon */}
        <div 
          className="w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center border-2"
          style={{ 
            background: "linear-gradient(145deg, #FFFCF7 0%, #FFF8EE 50%, #F3E8D6 100%)",
            borderColor: "rgba(201,160,99,0.5)",
            boxShadow: "0 16px 48px rgba(138,107,61,0.22), inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -2px 0 rgba(201,160,99,0.1)",
          }}
        >
          <span 
            className="text-6xl font-bold"
            style={{ 
              color: "#A78042",
              fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif",
              textShadow: "0 2px 4px rgba(167,128,66,0.2)",
            }}
          >
            م
          </span>
          {/* Small ornament star */}
          <span 
            className="absolute -top-1 right-3 text-sm"
            style={{ color: "#C9A063" }}
          >
            ✦
          </span>
        </div>

        {/* Brand title */}
        <h1
          className="text-[52px] font-extrabold tracking-tight mb-2 drop-shadow-sm"
          style={{ 
            color: "#2F2B25",
            fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          مواعيدك
        </h1>

        {/* Gold ornamental divider */}
        <div className="flex items-center justify-center gap-4 my-6">
          <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #C9A063)" }} />
          <span style={{ color: "#C9A063", fontSize: "10px" }}>✦</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #C9A063, transparent)" }} />
        </div>

        {/* Tagline */}
        <p
          className="text-xl font-semibold tracking-wide mb-2"
          style={{ 
            color: "#A78042", 
            fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" 
          }}
        >
          رفيق يومك في كل موعد
        </p>

        {/* Lower descriptive text */}
        <p
          className="text-base font-medium tracking-wide"
          style={{ 
            color: "#6F6557", 
            fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" 
          }}
        >
          راتبك، تقويمك، ومواعيدك
        </p>

        {/* Additional ornament below text */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(201,160,99,0.4))" }} />
          <span style={{ color: "#C9A063", opacity: 0.6, fontSize: "8px" }}>◆</span>
          <div className="h-px w-10" style={{ background: "linear-gradient(90deg, rgba(201,160,99,0.4), transparent)" }} />
        </div>
      </div>

      {/* Loading indicator dots */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{
                background: "#C9A063",
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom branding strip */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <p 
          className="text-xs font-medium"
          style={{ color: "#8A8175", fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}
        >
          Mawaeedak © 2026
        </p>
      </div>
    </div>
  );
}
