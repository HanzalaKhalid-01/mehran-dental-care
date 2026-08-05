import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-[#1E3A5F]">Mehran Dental Care</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to the clinic system</p>
      </div>
      <LoginForm />
    </div>
  );
}
