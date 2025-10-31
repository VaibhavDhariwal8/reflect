import { inngest } from "./client";
import { fetchArticles } from "./function";
import prisma from "@/lib/prisma";
import { topicsToCategories } from "@/lib/topics";
import { buildNewsletterHtml } from "@/lib/newsletter_html";
import { sendEmail } from "@/lib/mailer";
import { nextSendAtFrom } from "@/lib/frequency";
import { GoogleGenerativeAI } from "@google/generative-ai";

type EventData = { userId?: string; kindeId?: string; topicsInline?: string };

export default inngest.createFunction(
  { id: "ReflectNewsletter" },   // single canonical id
  { event: "scheduled.newsletter" },
  async ({ event, step, runId }) => {
    const data = (event.data as EventData) || {};
    let internalUserId = data.userId || null;

    if (!internalUserId && data.kindeId) {
      const found = (await step.run("resolve-user-by-kinde", () =>
        prisma.user.findUnique({
          where: { kindeId: data.kindeId! },
          select: { id: true },
        })
      )) as { id: string } | null;
      internalUserId = found?.id ?? null;
    }

    if (!internalUserId) {
      console.log("[newsletter] missing internal user id; skipping", { runId, dataKeys: Object.keys(data) });
      return;
    }

    const { pref, user } = await step.run("load-user-and-preferences", async () => {
      const [pref, user] = await Promise.all([
        prisma.preference.findUnique({
          where: { userId: internalUserId! },
          select: { topics: true, paused: true, frequency: true },
        }),
        prisma.user.findUnique({
          where: { id: internalUserId! },
          select: { email: true, name: true },
        }),
      ]);
      return { pref, user };
    }) as {
      pref: { topics?: string | null; paused?: boolean | null; frequency?: string | null } | null;
      user: { email?: string | null; name?: string | null } | null;
    };

    if (!pref) { console.log("[newsletter] no preferences; skipping", { internalUserId, runId }); return; }
    if (pref.paused) { console.log("[newsletter] paused; skipping", { internalUserId, runId }); return; }
    if (!user?.email) { console.log("[newsletter] no email; skipping", { internalUserId, runId }); return; }

    const topicsRaw = (pref.topics ?? "").trim() || null;
    const categories = topicsToCategories(topicsRaw || "");
    const effectiveTopics = categories.length ? categories : ["technology", "business", "politics"];

    const allArticles = await step.run("fetch-news", () => fetchArticles(effectiveTopics));

    // Summarize with Gemini
    const aiResponse = await step.run("summarize-with-gemini", async () => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      console.log("Gemini key present:", !!process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt =
        "You are an expert newsletter editor. Produce a concise, engaging, sectioned newsletter body (no HTML, plain text). " +
        "Include short headers and bulleted takeaways. End with 3–5 quick links.\n\n" +
        `Create a newsletter summary.\n` +
        `Topics: ${(effectiveTopics || []).join(", ")}\n` +
        `Articles:\n` +
        (allArticles ?? [])
          .map((a: any, i: number) => `${i + 1}. ${a.title}\n${a.description}\n${a.url}\n`)
          .join("\n");

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    });

    const bodyText = aiResponse?.trim() || "No summary available.";
    await step.run("log-summary", async()=> {
      console.log("[newsletter] generated summary:\n", bodyText);
    });

    const subject = `Your ${(pref.frequency || "DAILY").toLowerCase()} AI Newsletter — ${new Date().toLocaleDateString()}`;
    const html = buildNewsletterHtml({ title: subject, body: bodyText });

    const issue = (await step.run("create-issue", () =>
      prisma.issue.create({
        data: {
          title: subject,
          subject,
          topics: topicsRaw,
          html,
          metaJson: JSON.stringify({
            topics: effectiveTopics,
            count: (allArticles ?? []).length,
            generatedAt: new Date().toISOString(),
          }),
        },
        select: { id: true },
      })
    )) as { id: string };

    let deliveryStatus: "SENT" | "FAILED" = "SENT";
    let deliveryError: string | null = null;

    try {
      await step.run("send-email", () =>
        sendEmail({ to: user.email!, subject, html })
      );
    } catch (err: any) {
      deliveryStatus = "FAILED";
      deliveryError = err?.message || String(err);
    }

    const now = new Date();
    const recipientEmail = (user?.email ?? "").trim() || null;
    const recipientName = (user?.name ?? "").trim() || null;

    await step.run("record-delivery", () =>
      prisma.delivery.create({
        data: {
          userId: internalUserId!,
          issueId: issue.id,
          status: deliveryStatus,
          error: deliveryError,
          subject: subject || "AI Newsletter",
          toEmail: recipientEmail,
          toName: recipientName,
          topics: topicsRaw,
          sentAt: now,
        },
        select: { id: true },
      })
    );

    if (deliveryStatus === "SENT") {
      await step.run("bump-preference-schedule-success", () =>
        prisma.preference.update({
          where: { userId: internalUserId! },
          data: {
            lastSentAt: now,
            nextSendAt: nextSendAtFrom(pref.frequency as any, now),
          },
        })
      );
    } else {
      const retryAt = new Date(now.getTime() + 15 * 60_000);
      await step.run("bump-preference-schedule-retry", () =>
        prisma.preference.update({
          where: { userId: internalUserId! },
          data: { nextSendAt: retryAt },
        })
      );
    }

    console.log("[newsletter] finished", { userId: internalUserId, status: deliveryStatus, runId });
  }
);
