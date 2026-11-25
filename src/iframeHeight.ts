// Parent side of Connect's iframeSizer script: the child does
// parent.postMessage(<number of px>, "*") on load and when its height changes.
// Filter the browser console on "[iframe-host]" to debug.
const TAG = "[iframe-host]";
const NO_MESSAGE_WARN_MS = 5000;

export function startHeightListener(
  getFrame: () => HTMLIFrameElement | null,
  connectOrigin: string,
  onHeight?: (height: number) => void,
) {
  let last = 0;
  console.log(`${TAG} listening for height messages from ${connectOrigin}`);

  const timer = setTimeout(() => {
    if (!last)
      console.warn(
        `${TAG} no height message from ${connectOrigin} after ${NO_MESSAGE_WARN_MS / 1000}s. ` +
          "Is the iframeSizer script loaded in Connect, and is the iframe URL on the expected origin?",
      );
  }, NO_MESSAGE_WARN_MS);

  function onMessage(e: MessageEvent) {
    const frame = getFrame();
    // Other widgets (OneTrust, etc.) post to window too; only look at our iframe.
    if (!frame || e.source !== frame.contentWindow) return;

    if (e.origin !== connectOrigin) {
      console.warn(
        `${TAG} ignored message: origin ${e.origin} !== expected ${connectOrigin}`,
        e.data,
      );
      return;
    }
    if (typeof e.data !== "number") return; // e.g. CONNECT_READY objects
    if (!Number.isFinite(e.data) || e.data <= 0) {
      console.warn(`${TAG} ignored invalid height:`, e.data);
      return;
    }
    if (e.data === last) return;

    last = e.data;
    frame.style.height = `${e.data}px`;
    console.log(`${TAG} height -> ${e.data}px`);
    onHeight?.(e.data);
  }

  window.addEventListener("message", onMessage);
  return () => {
    clearTimeout(timer);
    window.removeEventListener("message", onMessage);
  };
}
