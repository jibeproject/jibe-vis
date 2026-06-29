import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ProtectedRoute from './ProtectedRoute';
import { useDeveloperRole } from '../hooks/useDeveloperRole';

interface DevRouteProps {
  element: React.ReactElement;
  user: any;
  signOut: () => void;
}

/**
 * Like ProtectedRoute, but additionally restricts access to members of the
 * Cognito `developers` group. Non-developers who are otherwise signed in see a
 * "not authorised" message rather than the developer tooling.
 */
const DevRoute: React.FC<DevRouteProps> = ({ element, user, signOut }) => {
  const { isDeveloper, loading } = useDeveloperRole();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="3rem">
        <CircularProgress />
      </Box>
    );
  }

  if (!isDeveloper) {
    return (
      <ProtectedRoute
        user={user}
        signOut={signOut}
        element={
          <Box maxWidth="md" margin="3rem auto" padding="1rem" textAlign="center">
            <Typography variant="h6" gutterBottom>
              Developer access required
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This area is restricted to the JIBE-Vis developer team. If you need
              access, ask to be added to the <code>developers</code> group.
            </Typography>
          </Box>
        }
      />
    );
  }

  return <ProtectedRoute element={element} user={user} signOut={signOut} />;
};

export default DevRoute;
