import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import ReflectNewsletter from "@/inngest/news";
import newsletterScheduler from "@/inngest/scheduler";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    ReflectNewsletter,
    newsletterScheduler
  ],
});