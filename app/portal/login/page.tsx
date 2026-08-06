import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#0EA5A4] transition-colors"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12.5 4 6.5 10l6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to home
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-[#1E3A5F]">Mehran Dental Care</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to the clinic system</p>
      </div>
      <LoginForm />
    </div>
  );
}
