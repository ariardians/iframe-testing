import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { AppBar, Box, Divider, Grid, TextField } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { useState } from "react";
import IframeResizer from "@iframe-resizer/react";

function App() {
  const [url, setUrl] = useState<string>(
    "https://connect-enduser-qa3.ifmsystems.com?market=DE&franchise=MITS&dealerCode=D10&isExternal=true"
  );
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Box
          sx={{
            flexGrow: 1,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </Grid>
            <Grid>
              <img src={reactLogo} className="logo react" alt="React logo" />
            </Grid>
          </Grid>
        </Box>
      </AppBar>
      <Box sx={{ textAlign: "center", mx: 2 }}>
        <TextField
          name="url"
          label="URL"
          variant="outlined"
          fullWidth
          size="small"
          margin="normal"
          onChange={(e) => {
            const iframe = document.getElementById(
              "serviceFormIframe"
            ) as HTMLIFrameElement;
            if (iframe) {
              iframe.src = e.target.value;
            }
            setUrl(e.target.value);
          }}
        />
      </Box>
      <Divider />
      <Box sx={{ textAlign: "center", margin: 2, overflowWrap: "anywhere" }}>
        <strong>Iframe URL:</strong> {url}
      </Box>
      <Divider />
      <IframeResizer
        license="GPLv3"
        log="collapsed"
        src={url}
        style={{ width: "100%", height: "100vh", border: "none" }}
      />
    </>
  );
}

export default App;
