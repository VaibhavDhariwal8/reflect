import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import ReflectNewsletter from "@/inngest/news";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    ReflectNewsletter
    /* your functions will be passed here later! */
  ],
});