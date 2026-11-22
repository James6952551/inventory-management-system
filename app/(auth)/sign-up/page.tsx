// app/sign-up/page.tsx
import SignUpForm from "@/components/SignUpForm";

export default function SignUpPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <SignUpForm />
    </div>
  );
}