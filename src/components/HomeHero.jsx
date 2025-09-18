import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function HomeHero() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-background to-muted">
            <div className="text-center space-y-6 px-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                    Welcome!
                </h1>
                <p className="max-w-md mx-auto text-lg text-muted-foreground">
                    Your Daily Reflect straight to your inbox. Choose <span className="font-semibold">daily</span>,{" "}
                    <span className="font-semibold">biweekly</span>, or{" "}
                    <span className="font-semibold">monthly</span>,{" "} updates.
                </p>
                <LoginLink className="inline-flex items-center bg-primary px-5 py-3 font-medium text-primary-foreground hover:shadow-lg transition-all duration-200 rounded-lg">
                    Sign in with Kinde
                </LoginLink>
            </div>
        </main>
    )
};