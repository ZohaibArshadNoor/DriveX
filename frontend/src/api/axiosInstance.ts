import axios from "axios";\n\nexport const axiosInstance = axios.create({\n  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",\n  withCredentials: true,\n});\n
