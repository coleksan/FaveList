import AuthForm from "@/components/auth/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm">
        {params.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {params.error === "auth_failed"
              ? "Authentication failed. Please try again."
              : params.error === "no_code_provided"
                ? "No authentication code received. Please try again."
                : `Error: ${params.error}`}
          </div>
        )}
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
