import axios from "axios";
import { getModMedConfig } from "./getModMedConfig";

const cfg = getModMedConfig();

const modmedClient = axios.create({
  baseURL: `${cfg.baseUrl}/${cfg.firmUrlPrefix}`,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": cfg.apiKey,
  },
});

export default modmedClient;
