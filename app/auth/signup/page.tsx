"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !name || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to create account")
        return
      }

      // Sign in the user
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.push("/products")
      } else {
        setError("Account created but sign in failed. Please try signing in.")
        router.push("/auth/signin")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full border border-black p-8">
        <h1 className="text-3xl font-bold text-black mb-6 text-center">Sign Up</h1>

        {error && (
          <div className="mb-4 p-3 border border-red-500 bg-white text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2 font-medium hover:opacity-80 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-black font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
