import { a, defineData, ClientSchema} from '@aws-amplify/backend';

const schema = a.schema({
  Feedback: a.model({
    comment: a.string(),
    datetime: a.datetime(),
    url: a.string()
    })
    .authorization( allow => [allow.publicApiKey().to(['create','list'])] )
});

// // Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof schema>;

// defines the data resource to be deployed
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});