"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { login } from "@/actions/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

export default function LoginPage() {
  const [state, action] = useFormState(login, {});

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your StockFlow account</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            errors={state.fieldErrors?.email}
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="Your password"
            required
            errors={state.fieldErrors?.password}
          />

          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <SubmitButton label="Sign In" loadingLabel="Signing in..." className="w-full mt-2" />
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
