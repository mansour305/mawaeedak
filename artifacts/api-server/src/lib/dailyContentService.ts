/**
 * Daily Content Service — Phase 13B
 *
 * يولد محتوى اليوم (رسالة + إشعار) بشكل تلقائي يومي.
 * - Idempotent: لا يولد إذا كانت رسالة اليوم موجودة فعلاً.
 * - Rule-based: لا يحتاج AI keys — pool من 65 رسالة عربية متنوعة.
 * - Timezone: Asia/Riyadh
 */

import { db } from "@workspace/db";
import { dailyMessagesTable, automationLogsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

const DAILY_MESSAGES: string[] = [
  "ابدأ يومك بسم الله، وستجد في كل خطوة بركة.",
  "أعظم الإنجازات تبدأ بقرار صغير — قرّر الآن.",
  "الصبر مفتاح الفرج، والعمل مفتاح النجاح.",
  "كل يوم فرصة جديدة — لا ترحّل اليوم ما تستطيع فعله الآن.",
  "خير الأعمال أدومها وإن قلّ.",
  "من أحسن نيته في عمله، بارك الله له في وقته.",
  "الوقت رأس مالك الحقيقي — كيف ستستثمره اليوم؟",
  "لكل عقبة مفتاح، ابحث عن المفتاح لا عن الأعذار.",
  "الدقائق الضائعة لا تعود، لكن القرارات الصحيحة تبني المستقبل.",
  "ابنِ يومك على عبادة وسعي وراحة — فالتوازن هو الكمال.",
  "التخطيط نصف العمل، والعمل نصف النجاح.",
  "لا تقُل «لو» — قُل «كيف».",
  "الشكر يفتح أبواب المزيد، ابدأ يومك بالامتنان.",
  "من لا يُحاسب نفسه، تُحاسبه الحياة بأسلوب آخر.",
  "كبّر الهمة، وصغّر الأعذار.",
  "أصعب شيء هو البداية — ابدأ الآن وسيتبعك الزخم.",
  "العطاء بلا توقع مقابل يُضاعف ما تحصل عليه.",
  "نظّم أولوياتك: ما هو الأهم اليوم؟",
  "الترتيب في الأشياء الصغيرة يُفضي إلى نتائج كبيرة.",
  "يوم جديد، صفحة جديدة — ما الذي ستكتبه اليوم؟",
  "التواضع في النجاح والصبر في الشدة — علامة العاقل.",
  "لكل مشكلة حلول، ولكل حل خطوة أولى.",
  "أفضل وقت لتبدأ كان بالأمس — أفضل وقت الآن هو الآن.",
  "حافظ على عهودك مع نفسك — فهي أثمن من عهودك مع الآخرين.",
  "الجدية في العمل والإخلاص في النية — مفتاح التوفيق.",
  "لا تُقارن مسيرتك بغيرك؛ لكلٍّ طريقه وزمانه.",
  "كل دقيقة تُضيعها في التردد خسارة، وكل دقيقة عمل استثمار.",
  "الرزق يُبارك فيه بالحلال والسعي والتوكل.",
  "ابحث عن الفرصة في كل تحدٍّ، فالنجاح يختبئ خلف الصعاب.",
  "اليوم الذي تُحسن فيه نيتك، يكتب الله لك أجر كل عملك.",
  "الإنجاز الحقيقي ليس ما تملكه، بل ما تُقدمه.",
  "من صبر على الصعاب نال أحلى الثمار.",
  "خطوة واحدة للأمام، ولو صغيرة، خير من ألف خطوة في خيالك.",
  "الذاكرة تحفظ ما تفعل، فاجعل يومك جديراً بالذاكرة.",
  "تعلّم شيئاً جديداً اليوم — العقل يكبر بما يتعلمه.",
  "الإيمان بالنفس يبني الجبال، والشك يهدم ما بنيت.",
  "لا تؤجّل — أنجز ما تستطيع اليوم.",
  "اقرأ، فكّر، خطّط، نفّذ — هذه دورة النجاح.",
  "لكل بداية عسر، ولكل مثابرة ثمر.",
  "الكلمة الطيبة صدقة — تبدأ في بيتك وعملك ومجتمعك.",
  "رتّب مكانك ومساحتك، ترتّب معهما أفكارك.",
  "الصحة نعمة لا تُقدَّر بثمن — عامل جسدك بإكرام.",
  "كن منتجاً لا مشغولاً — المشغول يتحرك، والمنتج يُنجز.",
  "أوقات الفراغ فرص مقنّعة — كيف ستستثمرها؟",
  "الحياة قصيرة جداً للإهمال، وطويلة بما يكفي للإنجاز.",
  "تحدّث مع الله كثيراً واطلب العون، ثم انطلق واعمل.",
  "من وُضع له هدف وسار نحوه وجد الطريق.",
  "أنجح الناس من يُحوّل عاداته إلى منجزاته.",
  "ابتسامتك في وجه أخيك صدقة — ابدأ بها يومك.",
  "فرّق بين العاجل والمهم — ليس كل ما يستعجل يستحق.",
  "الاتزان في الإنفاق أمان، والتخطيط المالي راحة.",
  "ادعُ الله أن يُبارك في وقتك، فالبركة في الوقت من أعظم النعم.",
  "لا تنتظر الظروف المثالية — انطلق بما عندك.",
  "كل إنجاز كبير بدأ بفكرة صغيرة وقرار جريء.",
  "الصدق مع النفس أصعب المهارات وأنفعها.",
  "قيمة اليوم لا تُقاس بكثرة الأعمال، بل بجودتها.",
  "الهدف الواضح يجعل الطريق أقل صعوبة.",
  "لكل يوم بركة خاصة به — ابحث عنها واشكر عليها.",
  "التركيز على شيء واحد أفضل من التشتت في أشياء كثيرة.",
  "زد من رصيدك مع الله، فهو أثمن رصيد.",
  "اجعل يومك أفضل من أمسك في شيء واحد على الأقل.",
  "العمل الصالح لا يضيع حتى ولو لم يراه أحد.",
  "الوقوع في الخطأ حدث؛ البقاء فيه قرار.",
  "استعن بالله ولا تعجز — العجز أعظم من الفشل.",
  "يوم تُنجز فيه شيئاً صغيراً خير من يوم تحلم فيه بشيء كبير.",
];

export function getRiyadhDateString(offset = 0): string {
  const d = new Date(Date.now() + offset * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function pickMessage(dateKey: string): string {
  let hash = 5381;
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash * 33) ^ dateKey.charCodeAt(i)) >>> 0;
  }
  return DAILY_MESSAGES[hash % DAILY_MESSAGES.length]!;
}

async function logAutomation(
  job_name: string,
  status: string,
  details: string,
  items_created: number,
): Promise<void> {
  try {
    await db.insert(automationLogsTable).values({
      job_name,
      status,
      details,
      items_created,
      run_at: getRiyadhDateString(),
    });
  } catch (e) {
    logger.warn({ err: e }, "[AutoLog] فشل حفظ سجل الأتمتة");
  }
}

/**
 * generateDailyContent
 * Idempotent — يتخطى إذا وُجدت رسالة اليوم فعلاً.
 */
export async function generateDailyContent(): Promise<{
  status: "created" | "skipped" | "error";
  message?: string;
}> {
  const today = getRiyadhDateString();
  try {
    const existing = await db
      .select({ id: dailyMessagesTable.id })
      .from(dailyMessagesTable)
      .where(
        and(
          eq(dailyMessagesTable.display_date, today),
          eq(dailyMessagesTable.is_active, true),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      logger.info({ today }, "[DailyContent] رسالة اليوم موجودة — تخطي");
      await logAutomation("daily_content", "skipped", `رسالة ${today} موجودة`, 0);
      return { status: "skipped" };
    }

    const message = pickMessage(today);
    await db.insert(dailyMessagesTable).values({
      message,
      display_date: today,
      is_active: true,
    });

    logger.info({ today, message }, "[DailyContent] تم إنشاء رسالة اليوم");
    await logAutomation("daily_content", "success", `رسالة ${today}: ${message.slice(0, 60)}`, 1);
    return { status: "created", message };
  } catch (err) {
    logger.error({ err, today }, "[DailyContent] فشل إنشاء رسالة اليوم");
    await logAutomation("daily_content", "failure", String(err), 0);
    return { status: "error" };
  }
}

