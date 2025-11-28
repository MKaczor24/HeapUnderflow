"use client";

import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Input, Label } from "@/components/ui/index";

function LoginPage() {
  const router = useRouter();

  const { login } = useAuthStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;

    if (!email || !password) {
      setError("Please fill all the fields first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await login(email.toString(), password.toString());

    if (response.error) {
      setError(response.error!.message);
    } else {
      router.push("/");
    }

    setIsLoading(false);
  };

  return (
    <div>
      {error && <div className="">{error}</div>}
      <form onSubmit={handleSubmit}>
        
      </form>
    </div>
  );
}

export default LoginPage;
