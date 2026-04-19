import { redirect } from "next/navigation";
import { StaffLoginForm } from "@/components/auth/staff-login-form";
import { PageShell } from "@/components/ui/page-shell";
import { isStaffAuthenticated } from "@/lib/staff-auth";

export default async function StaffLoginPage() {
  if (await isStaffAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <PageShell className="flex min-h-[70vh] items-center justify-center">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-card backdrop-blur sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sage-700">Staff Access</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
          Sign in to the employee dashboard
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          This dashboard is restricted to staff members. Enter the employee ID and password to continue.
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-dashed border-sage-200 bg-sage-50 px-5 py-4">
          <p className="text-sm font-semibold text-sage-800">Demo credentials</p>
          <p className="mt-2 text-sm text-slate-600">
            Employee ID: <span className="font-semibold">ghost</span>
          </p>
          <p className="text-sm text-slate-600">
            Password: <span className="font-semibold">12345</span>
          </p>
        </div>

        <div className="mt-8">
          <StaffLoginForm />
        </div>
      </section>
    </PageShell>
  );
}
