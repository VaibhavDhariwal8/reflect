import prisma from "@/lib/prisma";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/dist/server/api-utils";

export default async function AfterLogin(){
    const {isAuthenticated, getUser} = getKindeServerSession();
    if(!await isAuthenticated()) redirect('/');

    const user = await getUser();
    const email = (user?.email ?? "").toLowerCase();
    const name = user?.given_name || user?.family_name ? `${user?.given_name || ""} ${user?.family_name || ""}`.trim() :
     user?.email ?? null;

    await prisma.user.upsert({
        where: {KindeId: user.id},
        update: {email, name},
        create: {KindeId: user.id, email, name}
    });
    redirect('/dashboard');
}