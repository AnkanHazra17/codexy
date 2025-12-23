"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoaderSpinner } from "./loader-spinner";

type PublicRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
};

export default function PublicRoute({
  children,
  redirectTo = "/dashboard",
  fallback,
}: PublicRouteProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
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

  if (session) {
    return null;
  }

  return <>{children}</>;
}

