"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoaderSpinner } from "./loader-spinner";
import { useSession } from "@/lib/auth-client";

type ProtectedRouteProps = {
  children: React.ReactNode | ((session: NonNullable<ReturnType<typeof useSession>["data"]>) => React.ReactNode);
  redirectTo?: string;
  fallback?: React.ReactNode;
};

export default function ProtectedRoute({
  children,
  redirectTo = "/sign-in",
  fallback,
}: ProtectedRouteProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push(redirectTo);
    }
  }, [session, isPending, router, redirectTo]);

  if (isPending) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center">
          <LoaderSpinner size={20} />
        </div>
      )
    );
  }

  if (!session) {
    return null;
  }

  // If children is a function, call it with session; otherwise render children as-is
  return <>{typeof children === "function" ? children(session) : children}</>;
}