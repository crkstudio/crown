import { getActivePopups } from "@/lib/queries";
import { WelcomePopup } from "./welcome-popup";

/** Lee los pop-ups activos (en caché) y se los pasa al componente del navegador. */
export async function PopupHost() {
  const popups = await getActivePopups();
  if (popups.length === 0) return null;
  return <WelcomePopup popups={popups} />;
}
