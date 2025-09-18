"use client"
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "./ui/dropdown-menu";
import Link from "next/link";

function getInitials(user){
    const firstInitial = user?.given_name ??
     user?.name?.split(" ")?.[0] ??
     user?.email?.split("@")?.[0] ??
     User;

    const lastInitial = user?.family_name ??
    (user?.name ? user.name.split(" ").slice(-1)[0] : "") ??
    "";


    const f = (firstInitial?.[0] ?? "U").toUpperCase();
    const l = (lastInitial?.[0] ?? (user?.name ? "" : (user?.email?.[1] ?? ""))).toUpperCase();

    return (f+l).slice(0,2);
}

export default function UserMenu({user}){
    if(!user){
        return (
            <div className="flex items-center gap-2">
                <LoginLink postLoginRedirectURL="/dashboard">
                    <Button size="sm">Sign in</Button>
                </LoginLink>
            </div>
        )
    }

    const initials = getInitials(user);
    const displayName = user.given_name ? `${user.given_name} ${user.family_name ?? ""}`.trim() :
    user.name ?? user.email;


    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="inline-flex items-center p-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
          aria-label="Open user menu"
          title={displayName}>
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-medium">
                        {initials}
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                    {displayName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <LogoutLink>Log out</LogoutLink>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}