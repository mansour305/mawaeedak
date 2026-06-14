import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerApiAuth } from "./lib/apiAuth";
import { registerPwaServiceWorker } from "./lib/pwaRegistration";
import { setupNotificationClickHandler } from "./lib/push/pushNotificationService";

function renderBootError(error: unknown): void {
  const rootElement = document.getElementById("root");
  const message = error instanceof Error ? error.message : String(error);

  console.error("[Mawaeedak] boot failure", error);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <main dir="rtl" style="min-height:100dvh;display:flex;align-items:center;justify-content:center;background:#f7f7f7;padding:24px;font-family:Arial,sans-serif;color:#222;text-align:center">
      <section style="max-width:360px;width:100%;background:white;border:1px solid #ddd;border-radius:20px;padding:24px;box-shadow:0 18px 48px rgba(0,0,0,.08)">
        <h1 style="font-size:20px;margin:0 0 10px;font-weight:800">تعذر تشغيل مواعيدك</h1>
        <p style="font-size:14px;line-height:1.8;margin:0 0 18px;color:#555">حدث خطأ أثناء تحميل التطبيق. تم منع الشاشة البيضاء وعرض هذه الرسالة لتسهيل التشخيص.</p>
        <pre style="white-space:pre-wrap;text-align:left;direction:ltr;background:#f3f3f3;border-radius:14px;padding:12px;font-size:12px;max-height:180px;overflow:auto;color:#333">${message.replace(/[<>&]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[ch] ?? ch))}</pre>
        <button onclick="location.reload()" style="margin-top:16px;width:100%;height:44px;border:0;border-radius:14px;background:#333;color:white;font-weight:800;font-size:15px">إعادة التحميل</button>
      </section>
    </main>
  `;
}

try {
  registerApiAuth();
  registerPwaServiceWorker();
  setupNotificationClickHandler();

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("#root element not found");
  }

  createRoot(rootElement).render(<App />);
} catch (error) {
  renderBootError(error);
}


