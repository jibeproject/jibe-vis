import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // Developer-only capabilities (e.g. the /dev data-ingestion dashboard) are
  // gated on membership of this group. Members are added out-of-band, e.g.
  //   aws cognito-idp admin-add-user-to-group \
  //     --user-pool-id <id> --username <email> --group-name developers
  groups: ['developers'],
});