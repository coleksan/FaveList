import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <AuthForm mode="login" />
    </div>
  );
}
