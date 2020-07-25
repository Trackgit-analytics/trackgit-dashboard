import axios from "axios";

const baseService = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

export default baseService;
