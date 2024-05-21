import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'JibeVisStorage',
  access: (allow) => ({
    'tiles/*': [
      allow.authenticated.to(['read']),
      allow.entity('identity').to(['read']),
      // allow.guest.to(['read']),
    ],
    'videos/*': [
      allow.authenticated.to(['read']),
      allow.entity('identity').to(['read']),
      // allow.guest.to(['read']),
    ],
  })
});