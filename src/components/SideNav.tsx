import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  LocalHospital as LogoIcon,
} from "@mui/icons-material";

const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 65;
const APP_NAME = "PatientCare";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Register Patient", icon: <PersonAddIcon />, path: "/register" },
  { text: "Search Patients", icon: <SearchIcon />, path: "/search" },
];

const SideNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNavigation = (path: string) => {
    setIsExpanded(true);
    navigate(path);
  };

  // Add click event listener to main content area
  useEffect(() => {
    const handleMainContentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the drawer
      if (!target.closest(".MuiDrawer-root")) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("click", handleMainContentClick);
    return () => {
      document.removeEventListener("click", handleMainContentClick);
    };
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
          gap: 1,
        }}
      >
        <LogoIcon
          sx={{
            color: theme.palette.primary.main,
            fontSize: 32,
          }}
        />
        {isExpanded && (
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: "bold",
              whiteSpace: "nowrap",
              opacity: 1,
              transition: "opacity 0.2s",
            }}
          >
            {APP_NAME}
          </Typography>
        )}
      </Box>
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip
              key={item.text}
              title={!isExpanded ? item.text : ""}
              placement="right"
            >
              <ListItem
                button
                onClick={() => handleNavigation(item.path)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  backgroundColor: isActive
                    ? theme.palette.primary.main
                    : "transparent",
                  "&:hover": {
                    backgroundColor: isActive
                      ? theme.palette.primary.dark
                      : theme.palette.action.hover,
                  },
                  transition: "background-color 0.2s",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isExpanded ? 3 : "auto",
                    justifyContent: "center",
                    color: isActive
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.secondary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: 1,
                      color: isActive
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                    }}
                  />
                )}
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </Drawer>
  );
};

export default React.memo(SideNav);
