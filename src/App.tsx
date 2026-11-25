import "./App.css";
import {
  Box,
  Button,
  Collapse,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect, useRef, useState } from "react";
import { startConsentBridge } from "./oneTrustConsent";
import { startHeightListener } from "./iframeHeight";

declare global {
  interface Window {
    OnetrustActiveGroups?: string;
    OneTrust?: unknown;
    OptanonWrapper?: () => void;
    dataLayer?: unknown[];
    OptanonActiveGroups?: string;
  }
}

function getWindowInfo(iframeUrl: string): Record<string, string> {
  return {
    "Iframe URL": iframeUrl,
  };
}

function App() {
  const defaultUrl =
    "https://connect-enduser-dev.ifmsystems.com/?market=ES&franchise=TOYO";

  const [inputUrl, setInputUrl] = useState<string>(defaultUrl);
  const [url, setUrl] = useState<string>(defaultUrl);
  const [reloadKey, setReloadKey] = useState(0);
  const [windowInfo, setWindowInfo] = useState<Record<string, string>>(() =>
    getWindowInfo(defaultUrl),
  );
  const [infoOpen, setInfoOpen] = useState(false);
  const [sendReferrer, setSendReferrer] = useState(true);
  const [consent, setConsent] = useState({ analytics: false, groups: "" });
  const [height, setHeight] = useState<number | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let origin: string;
    try {
      origin = new URL(url).origin;
    } catch {
      return; // not a valid URL yet
    }
    const stopConsent = startConsentBridge(
      () => frameRef.current,
      origin,
      (analytics, groups) => setConsent({ analytics, groups }),
    );
    const stopHeight = startHeightListener(
      () => frameRef.current,
      origin,
      setHeight,
    );
    return () => {
      stopConsent();
      stopHeight();
    };
  }, [url, reloadKey]);

  const loadUrl = () => {
    setUrl(inputUrl);
    setHeight(null);
    setReloadKey((k) => k + 1);
    setWindowInfo(getWindowInfo(inputUrl));
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ textAlign: "center", mx: 2 }}>
        <TextField
          name="url"
          label="URL"
          variant="outlined"
          fullWidth
          size="small"
          margin="normal"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadUrl()}
        />
        <Button
          variant="contained"
          onClick={loadUrl}
          sx={{ mb: "9px", whiteSpace: "nowrap" }}
        >
          Load URL
        </Button>
      </Box>
      <Box sx={{ mx: 2, mb: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={sendReferrer}
              onChange={(e) => setSendReferrer(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="caption">
              Send Referrer ({sendReferrer ? "default" : "no-referrer"})
            </Typography>
          }
        />
      </Box>
      <Divider />
      <Box sx={{ mx: 2, my: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            onClick={() => setInfoOpen((o) => !o)}
            sx={{ cursor: "pointer", userSelect: "none" }}
          >
            {infoOpen ? "▾" : "▸"} Window Info
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setWindowInfo(getWindowInfo(url))}
          >
            Refresh
          </Button>
        </Box>
        <Collapse in={infoOpen}>
          {Object.entries({
            ...windowInfo,
            "Iframe height": height ? `${height}px` : "(waiting for message)",
            "OneTrust analytics (C0002)": String(consent.analytics),
            OnetrustActiveGroups: consent.groups || "(none)",
          }).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "flex-start",
                mb: 0.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.78rem",
                  minWidth: 240,
                  flexShrink: 0,
                  fontFamily: "monospace",
                }}
              >
                {key}:
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: "0.78rem",
                  wordBreak: "break-all",
                  color: "text.secondary",
                  fontFamily: "monospace",
                }}
              >
                {value}
              </Box>
            </Box>
          ))}
        </Collapse>
      </Box>
      <Divider />
      {/* height starts at 100vh; iframeHeight.ts overrides it from Connect's postMessage */}
      <iframe
        key={reloadKey}
        ref={frameRef}
        src={url}
        scrolling="no"
        referrerPolicy={sendReferrer ? undefined : "no-referrer"}
        style={{ display: "block", width: "100%", height: "100vh", border: "none" }}
      />
      <div id="ot-sdk-cookie-policy" style={{ display: "none" }}></div>
    </>
  );
}

export default App;
