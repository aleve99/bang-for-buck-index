import { AdminLoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/admin";

  return (
    <div className="py-10">
      <AdminLoginForm nextPath={nextPath} />
    </div>
  );
}
