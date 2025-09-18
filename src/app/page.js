import { redirect } from "next/navigation";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {


  // const {isAuthenticated} = getKindeServerSession();
  // if(await isAuthenticated()){
  //   redirect('/dashboard');
  // }

  // return <HomeHero />
}
