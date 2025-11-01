import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const AfterLoginPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: `${user.given_name} ${user.family_name}`,
        // Set default preferences on creation
        frequency: "daily",
        topics: ["Technology", "Science"],
        nextSendAt: new Date(), // Send first newsletter immediately or on next cycle
      },
    });
  }

  redirect("/dashboard");
};

export default AfterLoginPage;