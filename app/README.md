## Requirements
This Typescript website is built using Node.js and the Node package manager (npm).  Project dependencies installed via npm are listed in `packages.json`.  [Node.js](https://nodejs.org/en/download) is required to install dependencies, and build and run the website locally.  The app has also been designed with AWS services including Cognito (for authentication) and S3 (storage) using the Amplify framework.  

To align with existing AWS resources, save the [`amplify_outputs.json`](https://docs.amplify.aws/react/reference/amplify_outputs/) file in the `App` folder (ask Carl for assistance if unsure on this step).

With Node.js installed, to run the project locally,

2. Install dependencies
```
npm install
```

3. Run the app
```
npm run dev
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open at the given localhost web address to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches testing

### `npm run build`

Builds the app for production.

## AWS Amplify

This app has been design as a Gen2 AWS Amplify app linked with Github for continuous integration.  As changes are commited and pushed to Github, the app is re-deployed.  This takes a few minutes to build, so small are changes may be best developed and tested locally before pushing changes in a larger batch.