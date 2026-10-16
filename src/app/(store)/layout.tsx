import { Suspense } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart-drawer";
import { PopupHost } from "@/components/popup-host";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <Suspense fallback={null}>
        <PopupHost />
      </Suspense>
    </>
  );
}
