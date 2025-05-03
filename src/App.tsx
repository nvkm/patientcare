import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Box, CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SideNav from "./components/SideNav";
import Dashboard from "./components/Dashboard";
import PatientForm from "./components/PatientForm";
import SqlQuerySearch from "./components/SqlQuerySearch";
import { db } from "./services/database";

// Initialize the database
db.init()
  .then(() => {
    console.log("Database initialized successfully");
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
  });

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: "flex" }}>
            <SideNav />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - 240px)` },
                ml: { sm: "240px" },
                minHeight: "100vh",
                bgcolor: "background.default",
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/register" element={<PatientForm />} />
                <Route path="/search" element={<SqlQuerySearch />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
