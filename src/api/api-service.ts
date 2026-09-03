import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { snackbarService } from "@store/snackbar/snackbar.service";
import { stringify } from "query-string";
export type CustomError = {
  message: string;
  field?: string;
};

export class RequestError {
  constructor(public errors: CustomError[], public statusCode: number) {}

  checkErrorsAndNotify = () => {
    this.errors.forEach((error) => {
      const message = error.field
        ? `Field Error: [${error.field}] - ${error.message}`
        : error.message;

      snackbarService.upsertNotification({
        status: "error",
        message,
        dismissAfter: 0,
      });
    });
  };

  setFormErrors = (setError: any) => {
    const apiErrors: { message: string }[] = [];
    this.errors.forEach((error) => {
      if (error.field) {
        setError(error.field, {
          type: "server",
          message: error.message,
        });
      } else {
        apiErrors.push({ message: error.message });
      }
    });
    return apiErrors;
  };
}

type Headers = { headers: unknown };

class ApiService {
  private baseAxiosConfig: AxiosRequestConfig = {
    baseURL: process.env.REACT_APP_BASE_URL,
    paramsSerializer: (params) => stringify(params),
  };

  private axiosInstance: AxiosInstance = axios.create(this.baseAxiosConfig);

  private pendingRequests: { (token: string): void }[] = [];
  private countOfPendingRequests: number = 0;
  private isAlreadyFetchingAccessToken: boolean = false;

  private addRequest(request: (token: string) => void) {
    this.pendingRequests.push(request);
  }

  private onNewAccessToken(access_token: string) {
    this.pendingRequests = this.pendingRequests.filter((request) => {
      request(access_token);
      return false;
    });
  }

  private onInvalidRefreshToken() {
    localStorage.removeItem("refToken");
    localStorage.removeItem("token");
    return (window.location.href = "/login");
  }

  constructor() {
    // EVERY REQUEST
    this.axiosInstance.interceptors.request.use(
      (req) => {
        this.countOfPendingRequests++;
        const token = localStorage.getItem("token");
        if (token) {
          req.headers["Authorization"] = `Bearer ${token}`;
        }
        return req;
      },
      (err) => Promise.reject(err)
    );

    // EVERY RESPONSE

    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.countOfPendingRequests--;
        return response;
      },
      (error) => {
        const {
          config,
          response: { status },
        } = error;
        const originalRequest = config;
        this.countOfPendingRequests--;

        const refreshToken = localStorage.getItem("refToken");

        if (
          status === 401 &&
          refreshToken &&
          this.isAlreadyFetchingAccessToken
        ) {
          return Promise.reject(error);
        }
        if (status === 401 && refreshToken) {
          if (
            !this.isAlreadyFetchingAccessToken &&
            this.countOfPendingRequests === 0
          ) {
            this.isAlreadyFetchingAccessToken = true;

            this.axiosInstance
              .post(`/public/auth/new-access-token`, {
                refreshToken,
              })
              .then((res) => {
                if (res && res.data.accessToken) {
                  this.isAlreadyFetchingAccessToken = false;
                  this.onNewAccessToken(res.data.accessToken);
                  localStorage.setItem("token", res.data.accessToken);
                  localStorage.setItem("refToken", res.data.refreshToken);
                }
              })
              .catch(() => {
                this.isAlreadyFetchingAccessToken = false;
                this.onInvalidRefreshToken();
              });
          }

          return new Promise((resolve) => {
            this.addRequest((access_token) => {
              originalRequest.headers.Authorization = `bearer ${access_token}`;
              resolve(this.axiosInstance(originalRequest));
            });
          });
        } else {
          if (status === 400 && error.response && error.response.data) {
            const customError = new RequestError(
              error.response.data.errors,
              error.response.data.status
            );
            if (config?.url.indexOf("auth") === -1) {
              customError.checkErrorsAndNotify();
            }
            return Promise.reject(customError);
          } else {
            let message = "Server Error";
            const errors = error.response?.data?.errors;
            if (errors && Array.isArray(errors) && errors[0]) {
              message = errors[0]?.message;
            }
            snackbarService.upsertNotification({
              status: "error",
              message,
            });

            return Promise.reject(error);
          }
        }
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  post<ResponseDto = unknown, RequestDto = unknown>(
    url: string,
    data?: RequestDto,
    headers?: Headers
  ): Promise<AxiosResponse<ResponseDto>> {
    return this.axiosInstance.post<RequestDto, AxiosResponse<ResponseDto>>(
      url,
      data,
      headers
    );
  }

  patch<ResponseDto = unknown, RequestDto = unknown>(
    url: string,
    data?: RequestDto,
    headers?: Headers
  ): Promise<AxiosResponse<ResponseDto>> {
    return this.axiosInstance.patch<RequestDto, AxiosResponse<ResponseDto>>(
      url,
      data,
      headers
    );
  }

  put<ResponseDto = unknown, RequestDto = unknown>(
    url: string,
    data?: RequestDto,
    headers?: Headers
  ): Promise<AxiosResponse<ResponseDto>> {
    return this.axiosInstance.put<RequestDto, AxiosResponse<ResponseDto>>(
      url,
      data,
      headers
    );
  }

  delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete(url, config);
  }
}

export const ApiServiceInstance = new ApiService();
