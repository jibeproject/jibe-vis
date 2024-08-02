import { useState } from 'react';
import JibeLogo from './vis/jibe-logo';
import { AppBar, Container, Tab, Typography, Box, Toolbar, Menu, MenuItem, IconButton, Collapse, List, ListItemButton, ListItemText } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link } from "react-router-dom";
import './navbar.css';
import { HashLink } from 'react-router-hash-link';


const pages = [
  {'value':'About','url':'/about', 
    'menu': [ 
      {'value':'Background','url':'/about#background'},
      {'value':'Aims','url':'/about#aims'},
      {'value':'Team','url':'/about#team'},
      {'value':'Videos','url':'/about#videos'},
      {'value':'Roadmap','url':'/about#roadmap'},
      {'value':'Priority planning','url':'/about#features'},
      {'value':'FAQ & Glossary','url': '/glossary'}, 
    ]}, 
    {'value':'Pathways','url': '/pathways', 'menu': []}, 
    {'value':'Resources','url': '/resources', 'menu': []},
  ];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  function renderTabs(horizontal:boolean = true) {
    return (
      <>
        {pages.map((page, i) => {
          const fancynav = horizontal && (
            page.value.toString().startsWith('About')
            ||
            page.url.toString().startsWith('#')
          );
          return (
            (page.menu.length === 0) ? (
              <MenuItem key={page.value} onClick={fancynav?handleClick:handleCloseNavMenu}>
                <Tab label={page.value} component={Link} value={i + 1} to={page.url} />
              </MenuItem>
            ) : (
              <MenuItem key={page.value} onClick={handleClick}>
                <Tab label={page.value} component={Link} value={i + 1} to={page.url} />
                {open ? <ExpandLess /> : <ExpandMore />}
                <Collapse in={open} timeout="auto" unmountOnExit id={horizontal?"navtabs":"navmenu"}>
                  <List component="div" disablePadding>
                    {page.menu.map((submenu) => (
                      <ListItemButton key={submenu.value} component={HashLink} to={submenu.url} sx={{ pl: 4 }} onClick={horizontal?void(0):handleCloseNavMenu}>
                        <ListItemText primary={submenu.value} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </MenuItem>
            )
          );
        })}
        </>
    );
  }

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
              aria-label="navigation menu"
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
              <Box>
              {renderTabs(false)}
              </Box>
            </Menu>
          </Box>
          <Box id="navtabs" sx={{ flexGrow: 0, display: { xs: 'none',  md: 'flex' } }}>
           {renderTabs()}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
    <div className="navFiller" /> 
    </div>
  );
};



export default Navbar;