import type { Metadata } from "next";
import { CrownMark } from "@/components/crown-logo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Ingresar · Admin Crown", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <CrownMark className="mx-auto h-10 w-auto" />
        <h1 className="display-md mt-8 text-center text-3xl">Panel de Crown</h1>
        <p className="mt-2 text-center text-muted">Ingresá con tu cuenta de administrador.</p>
        <LoginForm />
      </div>
    </main>
  );
}
