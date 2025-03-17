require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Read environment variables (ensure API_URL is set in Vercel)
const apiUrl = process.env.API_URL;
if (!apiUrl) {
  throw new Error("API_URL environment variable is not set!");
}

const production = process.env.PRODUCTION === "true";

// Define the content for environment files
const envContent = `
export const environment = {
  production: ${production},
  apiUrl: '${apiUrl}'
};
`;

// Write the environment files
const envPath = path.join(__dirname, "src/environments/environment.ts");
const envProdPath = path.join(
  __dirname,
  "src/environments/environment.prod.ts"
);

fs.writeFileSync(envPath, envContent);
fs.writeFileSync(envProdPath, envContent);

console.log("Environment files generated successfully.");
