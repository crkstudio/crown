import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { PanelSkeleton } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Crown" },
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 lg:grid lg:grid-cols-[250px_1fr]">
      <AdminNav />
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-[1180px]">
          {/* Todo lo que hay debajo lee datos privados en cada petición: se muestra en streaming. */}
          <Suspense fallback={<PanelSkeleton />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
