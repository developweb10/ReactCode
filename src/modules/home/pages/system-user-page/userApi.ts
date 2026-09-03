import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { User, UserFormData } from './types';

const API_BASE_URL = process.env.REACT_APP_BASE_URL;
// const API_BASE_URL = 'http://your-backend-url/api/v1';
const ACTION_TOKEN = 'nNqf84CA';
// Create the typed AxiosInstance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor to add Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // We check if headers exist (standard check for AxiosRequestConfig)
      if (!config.headers) {
        config.headers = {} as any;
      }
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const userApi = {
  // Creating a new user
  createUser: (userData: UserFormData): Promise<AxiosResponse<User>> => 
    api.post(`/public/auth/sign-up?actionToken=${ACTION_TOKEN}`, userData),

  // Fetching the user list
  getUsers: (params: { month: number; year: number }): Promise<AxiosResponse<User[]>> => 
    api.get(`/private/users`, { params }),

  // Deleting a user
  deleteUser: (email: string): Promise<AxiosResponse<void>> => 
    api.delete(`/public/auth/users?email=${email}&deleteToken=${ACTION_TOKEN}`),
};
// export const userApi = {
//   createUser: (userData: UserFormData): Promise<AxiosResponse<User>> => 
//     axios.post(`${API_BASE_URL}/public/auth/sign-up?actionToken=${ACTION_TOKEN}`, userData),

//   getUsers: (params: { month: number; year: number }): Promise<AxiosResponse<User[]>> => 
//     axios.get(`${API_BASE_URL}/private/users`, { params }),

//   deleteUser: (email: string): Promise<AxiosResponse<void>> => 
//     axios.delete(`${API_BASE_URL}/public/auth/users?email=${email}&deleteToken=${ACTION_TOKEN}`),
// };