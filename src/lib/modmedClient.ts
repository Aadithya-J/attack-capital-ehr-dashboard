import axios from "axios";
import { getModMedConfig } from "./getModMedConfig";

// Create a function that returns a configured client
export async function createModMedClient() {
  const cfg = await getModMedConfig();
  
  return axios.create({
    baseURL: `${cfg.baseUrl}/${cfg.firmUrlPrefix}`,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": cfg.apiKey,
    },
  });
}

// For backward compatibility, export a basic client
const modmedClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

export default modmedClient;
