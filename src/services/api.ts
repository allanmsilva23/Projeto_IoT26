import axios, { type AxiosInstance } from 'axios';
 
class ApiClient {
  private static instance: AxiosInstance;

  private constructor() {} // Impede instanciação externa

  public static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      ApiClient.instance = axios.create({
        baseURL: import.meta.env.VITE_BACK_END_URL || 'https://backend-rainsafe.onrender.com',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });
    }
    return ApiClient.instance;
  }
}

export default ApiClient;