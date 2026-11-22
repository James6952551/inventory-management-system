'use client';
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const router = useRouter()

    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) { 
            event.preventDefault()
            setIsSigningIn(true)
            setErrorMessage("")

            const formData = new FormData(event.currentTarget)
            const email = formData.get('email') as string
            const password = formData.get('password') as string
            
            const { data, error } = await authClient.signIn.email({
                email,
                password,
            },
            {
                onSuccess: () => { // Redirect user after sign-in 
                    setIsSigningIn(false)
                    router.push('/dashboard')
                    router.refresh()
                },
                onError: (ctx) => { // Catch the error using Better-Auth's onError callback
                    setIsSigningIn(false)
                    setErrorMessage(ctx.error.message || "Invalid email or password.")
                }
            })

            // Fallback safety check if error returns outside of callback
            if (error) {
                setIsSigningIn(false)
                setErrorMessage(error.message || "Failed to sign in.")
            }
    }

  return (
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Error Banner UI */}
        {errorMessage && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Form Layout */}
        <form 
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSigningIn}
            className="flex w-full justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
          >
            {isSigningIn? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-gray-900 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
  );
}