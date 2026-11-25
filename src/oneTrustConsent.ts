// Parent side of the Connect <-> OneTrust handshake (see Connect_OneTrust_Consent_Integration.md).
// Returns the consent payload sent, via onPush, so the UI can show it.
export function startConsentBridge(
  getFrame: () => HTMLIFrameElement | null,
  connectOrigin: string,
  onPush?: (analytics: boolean, groups: string) => void,
) {
  function pushConsent() {
    const frame = getFrame();
    const groups = window.OnetrustActiveGroups || "";
    const analytics = groups.includes(",C0002,");
    onPush?.(analytics, groups);
    frame?.contentWindow?.postMessage(
      { type: "ONETRUST_CONSENT", version: 1, analytics, groups },
      connectOrigin,
    );
  }

  function onMessage(e: MessageEvent) {
    if (
      e.origin === connectOrigin &&
      e.source === getFrame()?.contentWindow &&
      e.data?.type === "CONNECT_READY"
    ) {
      pushConsent();
    }
  }
  window.addEventListener("message", onMessage);

  // OneTrust calls OptanonWrapper on load and on every consent change.
  const previous = window.OptanonWrapper;
  window.OptanonWrapper = () => {
    previous?.();
    pushConsent();
  };

  // OneTrust may already have loaded before we registered.
  if (window.OnetrustActiveGroups) pushConsent();

  return () => {
    window.removeEventListener("message", onMessage);
    window.OptanonWrapper = previous;
  };
}
