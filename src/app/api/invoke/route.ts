import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { ok } from "inngest/types";

export const runtime = "nodejs";


export async function POST(request: Request) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if(!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const topicsInline = typeof body.topics === "string" ? body.topics : "";

    const sent = await inngest.send({
        name: "scheduled.newsletter",
        data: {
            kindeId: user.id,
            topicsInline,
        },
    });

    const eventId = (sent && sent.ids?.[0]) || null;
    return NextResponse.json({ok : true, eventId }, { status: 200 });
}