import axios from "axios";

// this file is used to create an axios instance with default headers and base URL
// also it will handle the token management and error handling globally

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  baseURL: BASE_URL,
  // withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // if token exists, add it to the headers so that the server can verify the user, otherwise proceed without it
  // this helps in maintaining the user session across different requests
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Bearer 9348ytuierhfbieh
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors globally
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event("force-logout"));
    }
    return Promise.reject(error); // propagate the error to the calling function
  }
);

const postData = async <T>(path: string, data: unknown): Promise<T> => {
  const response = await api.post(path, data);
  return response.data;
};

const getData = async <T>(path: string): Promise<T> => {
  const response = await api.get(path);
  return response.data;
};

const updateData = async <T>(path: string, data: unknown): Promise<T> => {
  const response = await api.put(path, data);
  return response.data;
};
const deleteData = async <T>(path: string): Promise<T> => {
  const response = await api.delete(path);
  return response.data;
};

export { postData, getData, updateData, deleteData };
