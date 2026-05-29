import { useState } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/hooks/useStore";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useListThemes } from "@workspace/api-client-react";

const CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", 
  "أبها", "تبوك", "القصيم", "حائل", "الجوف"
];

const INTERESTS = [
  { id: "salary", label: "الرواتب" },
  { id: "citizen", label: "حساب المواطن" },
  { id: "support", label: "الضمان المطور" },
  { id: "housing", label: "الدعم السكني" },
  { id: "retirement", label: "التقاعد" },
  { id: "insurance", label: "التأمينات" },
  { id: "jobs", label: "الوظائف والأخبار" },
  { id: "prayers", label: "مواقيت الصلاة" },
  { id: "study", label: "الدراسة والإجازات" },
];

export default function WelcomePage() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { user, setUser } = useStore();
  const { changeTheme } = useTheme();
  
  const [name, setName] = useState(user?.name || "");
  const [city, setCity] = useState(user?.city || "الرياض");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  
  const { data: themes } = useListThemes();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setUser({
        name,
        city,
        interests: selectedInterests,
        onboardingComplete: true
      });
      setLocation("/");
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col max-w-[480px] mx-auto app-frame">
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 mt-4">
          <div className="text-xl font-bold text-primary">مواعيدك</div>
          <div className="text-sm font-medium text-muted-foreground">خطوة {step} من 3</div>
        </div>

        {step === 1 && (
          <div className="flex-1 animate-in slide-in-from-right-4 fade-in duration-300">
            <h1 className="text-3xl font-extrabold mb-4 leading-tight">أهلاً بك في منصتك الشخصية</h1>
            <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
              دَعنا نتعرف عليك لنقدم لك تجربة مخصصة تواكب يومك ومواعيدك.
            </p>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base">الاسم أو اللقب</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="كيف تحب أن نناديك؟" 
                  className="h-14 text-lg rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="city" className="text-base">مدينتك</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-14 text-lg rounded-xl">
                    <SelectValue placeholder="اختر مدينتك" />
                  </SelectTrigger>
                  <SelectContent className="rtl">
                    {CITIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">تستخدم لحساب مواقيت الصلاة بدقة.</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 animate-in slide-in-from-right-4 fade-in duration-300">
            <h1 className="text-3xl font-extrabold mb-4 leading-tight">ما هي اهتماماتك؟</h1>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              اختر المواضيع التي تهمك لتخصيص الإشعارات والمحتوى.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map(interest => (
                <div 
                  key={interest.id}
                  className={cn(
                    "flex items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
                    selectedInterests.includes(interest.id) 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:border-border/80"
                  )}
                  onClick={() => toggleInterest(interest.id)}
                >
                  <Checkbox 
                    id={interest.id} 
                    checked={selectedInterests.includes(interest.id)} 
                    onCheckedChange={() => toggleInterest(interest.id)}
                    className="pointer-events-none"
                  />
                  <Label htmlFor={interest.id} className="text-base pointer-events-none cursor-pointer flex-1 font-medium">
                    {interest.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 animate-in slide-in-from-right-4 fade-in duration-300">
            <h1 className="text-3xl font-extrabold mb-4 leading-tight">اختر مظهر منصتك</h1>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              اختر الثيم الذي يعكس ذوقك (يمكنك تغييره لاحقاً).
            </p>

            <div className="space-y-4">
              {themes?.map((theme) => (
                <Card 
                  key={theme.slug} 
                  className="p-4 cursor-pointer hover:border-primary transition-colors border-2 group"
                  onClick={() => changeTheme(theme.slug)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{theme.name}</h3>
                      {theme.description && <p className="text-sm text-muted-foreground">{theme.description}</p>}
                    </div>
                    <div className="flex gap-1.5 rtl:flex-row-reverse">
                      {theme.colors && Object.entries(theme.colors as Record<string, string>).slice(0, 3).map(([key, val]) => (
                        <div 
                          key={key} 
                          className="w-6 h-6 rounded-full border shadow-sm" 
                          style={{ backgroundColor: String(val) }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-card border-t border-border flex justify-between gap-4">
        {step > 1 ? (
          <Button variant="outline" className="h-14 px-6 rounded-xl shrink-0" onClick={handlePrev}>
            <ArrowRight className="w-5 h-5 ml-2" />
            السابق
          </Button>
        ) : <div className="w-[100px]" />}
        
        <Button className="h-14 flex-1 text-lg font-bold rounded-xl" onClick={handleNext}>
          {step === 3 ? "ابدأ تجربتك" : "التالي"}
          {step < 3 && <ArrowLeft className="w-5 h-5 mr-2" />}
        </Button>
      </div>
    </div>
  );
}
