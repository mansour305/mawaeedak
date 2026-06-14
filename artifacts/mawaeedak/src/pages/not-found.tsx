import { Link } from "wouter";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(180deg, hsl(34 40% 94%) 0%, hsl(34 30% 89%) 100%)" }}
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6">
        <SearchX className="w-9 h-9 text-primary" />
      </div>
      <h1 className="text-6xl font-extrabold text-primary mb-3" style={{ fontFamily: "Tajawal, sans-serif" }}>
        404
      </h1>
      <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
        الصفحة غير موجودة
      </h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-[280px] leading-relaxed" style={{ fontFamily: "Tajawal, sans-serif" }}>
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link href="/">
        <Button className="h-12 px-8 rounded-xl font-bold text-base gap-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
          <Home className="w-5 h-5" />
          العودة للرئيسية
        </Button>
      </Link>
    </div>
  );
}

