import * as dotenv from "dotenv";
import path = require("path");

// 1. Configure dotenv to read from our `.env` file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 2. Define a TS Type to type the returned envs from our function below.
export type ConfigProps = {
  REGION: string;
};

// 3. Define a function to retrieve our env variables
export const getConfig = (): ConfigProps => ({
  REGION: process.env.REGION || "ap-southeast-2",
});