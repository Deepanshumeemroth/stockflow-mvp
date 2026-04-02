"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { signup } from "@/actions/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

export default function SignupPage() {
  const [state, action] = useFormState(signup, {});

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Start managing your inventory with StockFlow
          </p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <FormField
            label="Organization Name"
            name="orgName"
            placeholder="Acme Corp"
            required
            errors={state.fieldErrors?.orgName}
          />
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
            placeholder="Min. 8 characters"
            required
            errors={state.fieldErrors?.password}
          />

          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {state.error}
            </p>
          )}

          <SubmitButton label="Create Account" loadingLabel="Creating..." className="w-full mt-2" />
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
