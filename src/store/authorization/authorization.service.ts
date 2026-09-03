import { applyTransaction } from "@datorama/akita";
import {
  AuthorizationStore,
  authorizationStore,
  AuthState,
} from "./authorization.store";
import { tasksStore, TasksStore } from "../tasks/tasks.store";
import { AuthorizationApi } from "@api/authorization/authorization.api";
import { RequestError } from "@api/api-service";
import { snackbarService } from "@store/snackbar/snackbar.service";
import {
  SignInDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "@models/authorization.models";

export class AuthorizationService {
  constructor(
    private authorizationStore: AuthorizationStore,
    private tasksStore: TasksStore
  ) {}

  async checkTokenStatus() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.authorizationStore.update((state) => ({
        ...state,
        user: null,
        authState: AuthState.UNAUTHORIZED,
      }));
      return;
    }

    this.authorizationStore.update((state) => ({
      ...state,
      authState: AuthState.FETCHING,
    }));

    try {
      const response = await AuthorizationApi.checkUser();
      const user = response.data;
      const newTasks = response.data.newTasks;

      applyTransaction(() => {
        this.authorizationStore.update((state) => ({
          ...state,
          authState: AuthState.SIGNED_IN,
          user: {
            ...user,
            newTasks: undefined,
          },
        }));
        this.tasksStore.update((state) => ({
          ...state,
          newTasksCount: newTasks,
        }));
      });
    } catch (e) {
      this.authorizationStore.update((state) => ({
        ...state,
        authState: AuthState.UNAUTHORIZED,
      }));
    }
  }

  async checkNewTasks() {
    try {
      const response = await AuthorizationApi.checkUser();
      const newTasks = response.data.newTasks;

      this.tasksStore.update((state) => ({
        ...state,
        newTasksCount: newTasks,
        refetchRequired:
          newTasks !== state.newTasksCount &&
          window.location.pathname.indexOf("/tasks") !== -1,
      }));
    } catch (e) {}
  }

  async signIn(dto: SignInDto): Promise<RequestError | void> {
    try {
      const response = await AuthorizationApi.signIn(dto);

      const user = response.data;
      const newTasks = response.data.newTasks;
      applyTransaction(() => {
        this.authorizationStore.update((state) => ({
          ...state,
          user: {
            ...user,
            newTasks: undefined,
          },
          authState: AuthState.SIGNED_IN,
        }));
        this.tasksStore.update((state) => ({
          ...state,
          newTasksCount: newTasks,
        }));
      });
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("refToken", response.data.refreshToken);
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<RequestError | void> {
    try {
      await AuthorizationApi.forgotPassword(dto);
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<RequestError | void> {
    try {
      await AuthorizationApi.resetPassword(dto);
      snackbarService.upsertNotification({
        status: "success",
        message: "Your Password Has Been Reset",
      });
    } catch (error) {
      if (error && error.errors && error.errors[0]) {
        snackbarService.upsertNotification({
          status: "error",
          message: error.errors[0].message,
        });
      }
      throw error;
    }
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refToken");
    window.location.href = "/login";
  }
}

export const authorizationService = new AuthorizationService(
  authorizationStore,
  tasksStore
);
