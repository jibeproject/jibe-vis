# jibe-vis
Interactive visualisation app for exploring health impacts of urban planning scenarios based on large-scale transport and health simulation modelling.

![Software architecture](diagrams/architecture.drawio.png)

## Status
Preliminary draft (at time of writing, 7 May 2024)

![Software architecture](diagrams/architecture-status.drawio.png)

## Project structure

```
diagrams/ # Folder containing JIBE-Vis architecture and concept diagrams
app/ # Folder containing the JIBE-Vis web application
├── amplify/ # Folder containing Amplify backend configuration
│   ├── auth/ # Definition for authentication backend
│   │   └── resource.tsx
│   ├── storage/ # Definition for your storage backend
│   │   └── resource.ts
|   ├── backend.ts # Orchestration of backend infrastructure
├── src/ # React framework UI code
│   ├── components/ # Definition of discrete UI components (e.g. navbar and map)
│   ├── App.tsx # UI code
│   ├── index.css # Styling for your app
│   └── index.tsx # Application entry point
├── package.json # Project metadata file describing dependencies and script running
└── tsconfig.json # Configuration of TypeScript code compilation
```

This project structure draws on a React template for [AWS Amplify](https://docs.amplify.aws/react/), a framework for streamlined development and deploying of fullstack web applications using AWS cloud infrastructure.

## Requirements
This website is built using Node.js and the Node package manager (npm).  Project dependencies installed via npm are listed in `packages.json`.  [Node.js](https://nodejs.org/en/download) is required to install dependencies, and build and run the website locally.  With Node.js installed, to run the project locally,

1. Clone this repository
```
git clone https://github.com/jibeproject/jibe-vis.git
```

2. Install dependencies by running the following command within the jibe-vis/app folder
```
npm install
```

3. Run the app locally by running the following within the jibe-vis/app folder:
```
npm start
```

## Funding
We gratefully acknowledge funding and resources provided through the [RMIT AWS Supercomputing Hub (RACE Hub)](https://www.rmit.edu.au/partner/hubs/race) through grants RMAS00013 and CIC00014. 

## Provenance
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), and developed based on a series of AWS-related architecture design patterns:
- https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/web-application.html
- https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/create-a-react-app-by-using-aws-amplify-and-add-authentication-with-amazon-cognito.html
- https://ui.docs.amplify.aws/react/connected-components/authenticator


