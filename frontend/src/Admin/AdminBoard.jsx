import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  IconButton,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  useTheme,
  alpha,
  Button,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Block as BanIcon,
  Menu as MenuIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import { useUserStore } from "../store/user.js";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/Dashboard" },
  { text: "User Management", icon: <PeopleIcon />, path: "/UserManagement" },
  { text: "Banned Users", icon: <BanIcon />, path: "/BannedUsers" },
];

const AdminBoard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logoutUser } = useUserStore();

  // Handle logout
  const handleLogout = () => {
    const result = logoutUser();
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.light} 100%)`,
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            Artistry Hub Admin
          </Typography>

          <Button
            color="inherit"
            startIcon={<ExitToAppIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              padding: "8px 16px",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="center"
        sx={{
          minHeight: "100vh",
          p: 4,
          backgroundColor: theme.palette.background.default,
          [theme.breakpoints.up("sm")]: {
            p: 8,
          },
        }}
      >
        {menuItems.map((item) => (
          <Grid item key={item.text} xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                minWidth: 260,
                minHeight: 260,
                borderRadius: 4,
                transition: "transform 0.3s, box-shadow 0.3s",
                background: `linear-gradient(145deg, 
                  ${theme.palette.background.paper}, 
                  ${alpha(theme.palette.background.default, 0.5)})`,
                backdropFilter: "blur(12px)",
                boxShadow: `0 8px 32px ${alpha(
                  theme.palette.primary.dark,
                  0.1
                )}`,
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: `0 12px 48px ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )}`,
                },
              }}
            >
              <CardActionArea
                component={Link}
                to={item.path}
                sx={{
                  height: "100%",
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textAlign: "center",
                    }}
                  >
                    {item.text}
                  </Typography>
                  <Typography
                    component="div"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      color: theme.palette.primary.main,
                      "& .MuiSvgIcon-root": {
                        fontSize: "3.5rem",
                        padding: 2,
                        borderRadius: "50%",
                        background: `linear-gradient(45deg, 
                          ${alpha(theme.palette.primary.light, 0.1)} 0%, 
                          ${alpha(theme.palette.primary.light, 0.3)} 100%)`,
                        transition: "all 0.3s ease",
                      },
                      "&:hover .MuiSvgIcon-root": {
                        background: `linear-gradient(45deg, 
                          ${alpha(theme.palette.primary.light, 0.2)} 0%, 
                          ${alpha(theme.palette.primary.light, 0.4)} 100%)`,
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    {React.cloneElement(item.icon, {
                      sx: { fontSize: "3.5rem" },
                    })}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default AdminBoard;
