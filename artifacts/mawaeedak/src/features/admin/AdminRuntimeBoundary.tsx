import React from "react";

type AdminRuntimeBoundaryState = {
  hasError: boolean;
  message: string;
};

export class AdminRuntimeBoundary extends React.Component<React.PropsWithChildren, AdminRuntimeBoundaryState> {
  state: AdminRuntimeBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: unknown): AdminRuntimeBoundaryState {
    const message = error instanceof Error ? error.message : "Unknown admin runtime error";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("[AdminRuntimeBoundary]", error, info);
  }

  resetAdmin = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.includes("supabase") || key.startsWith("sb-") || key.includes("auth")) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch {
      // ignore storage cleanup failures
    }

    window.location.href = "/admin?reset=1";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main dir="rtl" className="min-h-screen flex items-center justify-center bg-[#f8efe0] px-4">
        <section className="w-full max-w-lg rounded-[28px] border border-[#d9bd8b] bg-[#fff7e8] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-red-200 bg-red-50 text-4xl text-red-600">
            ⚠️
          </div>

          <h1 className="mb-3 text-2xl font-black text-[#3a2112]">تعذر فتح لوحة المالك</h1>

          <p className="mb-6 text-sm leading-7 text-[#7b5b3c]">
            تم منع تعطل التطبيق وعزل الخطأ داخل لوحة المالك. أعد ضبط جلسة المالك ثم سجّل الدخول مجدداً.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={this.resetAdmin}
              className="w-full rounded-2xl bg-[#9c6a1a] px-5 py-3 text-sm font-black text-white shadow-lg"
            >
              إعادة ضبط جلسة المالك
            </button>

            <a
              href="/"
              className="block w-full rounded-2xl border border-[#9c6a1a]/40 px-5 py-3 text-sm font-black text-[#3a2112]"
            >
              العودة للرئيسية
            </a>
          </div>

          <p className="mt-5 break-words rounded-xl bg-white/70 p-3 text-left text-[11px] text-[#8c6f55]" dir="ltr">
            {this.state.message}
          </p>
        </section>
      </main>
    );
  }
}

