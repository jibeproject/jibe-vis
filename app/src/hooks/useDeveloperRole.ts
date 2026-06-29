import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

export const DEVELOPER_GROUP = 'developers';

/**
 * Reads the Cognito `cognito:groups` claim from the current session and reports
 * whether the signed-in user belongs to the developers group.
 *
 * This is a convenience for UI gating only — every privileged action is also
 * re-checked server-side in the dev-admin Lambda.
 */
export function useDeveloperRole() {
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await fetchAuthSession();
        const groups = (session.tokens?.idToken?.payload?.['cognito:groups'] ??
          []) as string[];
        if (active) setIsDeveloper(Array.isArray(groups) && groups.includes(DEVELOPER_GROUP));
      } catch {
        if (active) setIsDeveloper(false);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { isDeveloper, loading };
}
