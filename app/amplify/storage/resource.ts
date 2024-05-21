import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'JibeVisStorage',
  access: (allow) => ({
    '*.pmtiles': [
      allow.authenticated.to(['read']),
      allow.entity('identity').to(['read']),
      // allow.guest.to(['read']),
    ],
  })
});