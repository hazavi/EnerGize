const fs = require("fs");
const path = require("path");

// Read environment variables from process.env
const apiUrl = process.env.API_URL || "https://default-api-url.com/api";
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
