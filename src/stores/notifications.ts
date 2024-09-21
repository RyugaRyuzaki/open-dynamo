import {isBrowser} from "@constants/browser";

export const registerNotifications =
  async (): Promise<PushSubscription | null> => {
    if (!isBrowser) return null;
    const web_push_key = import.meta.env.VITE_WEB_PUSH_PUBLIC as string;
    if (!web_push_key) return null;
    const registration = await navigator.serviceWorker.register(
      new URL("./service-worker.ts", import.meta.url)
    );
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(web_push_key),
    });
  };

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
