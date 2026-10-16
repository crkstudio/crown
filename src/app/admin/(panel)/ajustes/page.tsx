import { PageHeader } from "@/components/admin/ui";
import { PasswordForm, SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings } from "@/lib/admin-queries";
import { getPaymentProvider } from "@/lib/payments";

export const metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const settings = await getAdminSettings();
  return (
    <>
      <PageHeader title="Ajustes" description="Apertura de la tienda, envíos y seguridad de la cuenta." />
      <div className="space-y-10">
        <SettingsForm settings={settings} paymentsReady={getPaymentProvider().isConfigured()} />
        <PasswordForm />
      </div>
    </>
  );
}
