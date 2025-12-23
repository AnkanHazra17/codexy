import { FloatingPaths } from "@/components/core/floating-path";
import PublicRoute from "@/components/core/public-route";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicRoute>
      <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
        <div className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
          {/* <Logo className="mr-auto h-5" /> */}

          <div className="z-10 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-xl">
                &ldquo;Get instant, intelligent code reviews powered by AI. Catch bugs, improve code quality, and ship faster.&rdquo;
              </p>
              <footer className="font-mono font-semibold text-sm">
                Codexy AI Code Reviewer
              </footer>
            </blockquote>
          </div>
          <div className="absolute inset-0">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </div>
        </div>
        <div className="relative flex min-h-screen flex-col justify-center p-4">
          <div
            aria-hidden
            className="-z-10 absolute inset-0 isolate opacity-60 contain-strict"
          >
            <div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
            <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
            <div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
          </div>
          <Button asChild className="absolute top-7 left-5" variant="ghost">
            <Link href="/">
              <ChevronLeftIcon />
              Home
            </Link>
          </Button>
          <div className="mx-auto space-y-4 sm:w-sm">
            {/* <Logo className="h-5 lg:hidden" /> */}
            <div className="flex flex-col space-y-1">
              <h1 className="font-bold text-2xl tracking-wide">
                Sign In or Join Now!
              </h1>
              <p className="text-base text-muted-foreground">
                Sign in with GitHub to get started with AI code reviews.
              </p>
            </div>
            <div className="space-y-2">{children}</div>

            <p className="mt-8 text-muted-foreground text-sm">
              By clicking continue, you agree to our{" "}
              <a
                className="underline underline-offset-4 hover:text-primary"
                href="#"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                className="underline underline-offset-4 hover:text-primary"
                href="#"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </PublicRoute>
  );
}
