import axios from "axios";


const baseURL = `${process.env.MODMED_BASE_URL}/${process.env.MODMED_FIRM_URL_PREFIX}`
// console.log(baseURL)

const modmedClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default modmedClient;
