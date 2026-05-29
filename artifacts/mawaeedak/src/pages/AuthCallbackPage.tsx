import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type Status = "loading" | "success" | "error" | "expired";

export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) {
      setStatus("error");
      setMessage("تعذر الاتصال بخدمة المصادقة");
      return;
    }

    const sb = supabase;
    const handleCallback = async () => {
      try {
        const { data, error } = await sb.auth.getSession();

        if (error) {
          if (
            error.message?.includes("expired") ||
            error.message?.includes("invalid")
          ) {
            setStatus("expired");
            setMessage(
              "رابط التحقق غير صالح أو منتهي الصلاحية. أعد التسجيل أو اطلب رابطاً جديداً."
            );
          } else {
            setStatus("error");
            setMessage("تعذر التحقق من الرابط. حاول مرة أخرى.");
          }
          return;
        }

        if (data.session) {
          setStatus("success");
          setMessage("تم التحقق من حسابك بنجاح. جار التوجيه...");
          setTimeout(() => setLocation("/account"), 2000);
        } else {
          setStatus("expired");
          setMessage(
            "رابط التحقق غير صالح أو منتهي الصلاحية. أعد التسجيل أو اطلب رابطاً جديداً."
          );
        }
      } catch {
        setStatus("error");
        setMessage("حدث خطأ غير متوقع. حاول مرة أخرى.");
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "hsl(var(--background))" }}
      dir="rtl"
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ border: "1px solid hsl(38 45% 72% / 0.4)" }}
      >
        <div
          className="px-6 py-5 text-center"
          style={{
            background:
              "linear-gradient(135deg, hsl(22 55% 18%) 0%, hsl(28 50% 22%) 100%)",
          }}
        >
          <h1
            className="text-xl font-black tracking-wide"
            style={{ color: "hsl(38 72% 68%)" }}
          >
            مواعيدك
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(38 45% 55%)" }}>
            التحقق من الحساب
          </p>
        </div>

        <div
          className="px-6 py-8 text-center space-y-4"
          style={{
            background:
              "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
          }}
        >
          {status === "loading" && (
            <>
              <Loader2
                className="w-10 h-10 animate-spin mx-auto"
                style={{ color: "hsl(38 72% 52%)" }}
              />
              <p className="text-sm" style={{ color: "hsl(22 30% 45%)" }}>
                جار التحقق من الرابط...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2
                className="w-10 h-10 mx-auto"
                style={{ color: "hsl(130 40% 40%)" }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: "hsl(130 40% 35%)" }}
              >
                {message}
              </p>
            </>
          )}

          {(status === "error" || status === "expired") && (
            <>
              <XCircle
                className="w-10 h-10 mx-auto"
                style={{ color: "hsl(10 50% 45%)" }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: "hsl(10 50% 42%)" }}
              >
                {message}
              </p>
              <button
                onClick={() => setLocation("/")}
                className="mt-2 px-5 py-2 rounded-xl text-sm font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(38 72% 52%) 0%, hsl(32 68% 42%) 100%)",
                  color: "#fff",
                }}
              >
                العودة للرئيسية
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
