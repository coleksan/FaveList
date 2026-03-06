import AuthForm from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <AuthForm mode="signup" />
    </div>
  );
}
