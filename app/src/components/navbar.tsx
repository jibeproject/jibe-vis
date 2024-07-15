import { useState } from 'react';
import JibeLogo from './vis/jibe-logo';
import { AppBar, Container, Tab, Typography, Box, Toolbar, Menu, MenuItem, IconButton } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from "react-router-dom";
import './navbar.css';


const pages = [
  {'value':'About','url':'about/'}, 
  {'value':'Dashboard','url': 'map/'}, 
  {'value':'Glossary','url': 'glossary/'}, 
  {'value':'Resources','url': 'resources/'},
  ];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <div>
    <AppBar position="static" id="navbar">
        <Container maxWidth="xl">
        <Toolbar disableGutters>
        <Container className="logos">
          <Typography
            id="logo"
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              letterSpacing: '-0.01em',
              color: "#000",
              textDecoration: 'none',
              // flexGrow: 1, 
              display: { xs: 'flex', md: 'none' }
            }}
            >
            <JibeLogo/>
            Transport & Health Impacts
          </Typography>
            </Container>
          <Box id="navmenu" sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page,i) => (
                <MenuItem key={`${page.value}/`} onClick={handleCloseNavMenu}>
                  <Tab label={page.value} component={Link} value={i+1} to={page.url} />
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box id="navtabs" sx={{ flexGrow: 0, display: { xs: 'none',  md: 'flex' } }}>
              {pages.map((page,i) => (
                <MenuItem key={`${page.value}/`} onClick={handleCloseNavMenu}>
                  <Tab label={page.value} component={Link} value={i+1} to={page.url} />
                  </MenuItem>
              ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
    <div className="navFiller" /> 
    </div>
  );
};
export default Navbar;