"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/Auth";

function RegisterPage() {
  const { createAccount, login } = useAuthStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string | null;
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;

    if (!username || !email || !password) {
      setError("Please fill all the fields first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await createAccount(
      username.toString(),
      email.toString(),
      password.toString(),
    );

    if (response.error) {
      setError(response.error!.message);
    } else {
      const loginResponse = await login(email.toString(), password.toString());
      if (loginResponse.error) {
        setError(loginResponse.error!.message);
      }
    }

    setIsLoading(false);
  };
  return (
    <div>
      {error && <div className="">{error}</div>}
      <form onSubmit={handleSubmit}></form>
    </div>
  );
}

export default RegisterPage;
