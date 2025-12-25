"use client";

import { LoaderSpinner } from "@/components/core/loader-spinner";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import Image from "next/image";
import { useState } from "react";

function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Sign in error:", error);
      // TODO: Add toast notification for user feedback
      // For now, error is handled by better-auth redirect
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      className="w-full"
      size="lg"
      type="button"
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <LoaderSpinner />
          Loading...
        </>
      ) : (
        <>
          <Image
            src="/images/github-mark-white.svg"
            alt="logo"
            width={26}
            height={26}
          />
          Continue with GitHub
        </>
      )}
    </Button>
  );
}

export default SignIn;
