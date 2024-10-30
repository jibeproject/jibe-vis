import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface ProtectedRouteProps {
  element: React.ReactElement;
  user: any;
  signOut: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, user, signOut }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  return user ? (
    <>
            
    <div className="sign-out">
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id="sign-out-popup" 
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={signOut}>Sign out ({user?.signInDetails?.loginId})</MenuItem>
        </Menu>
      </div>
      {element}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;