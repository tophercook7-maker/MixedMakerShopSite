export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-black px-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 p-6 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-sm text-neutral-600">
          Supabase login will work after env vars are configured.
        </p>
      </div>
    </main>
  );
}
