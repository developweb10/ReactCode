import { EntityState, EntityStore, StoreConfig } from "@datorama/akita";
import { UserAuthModel } from "@models/authorization.models";

export enum AuthState {
  SIGNED_IN = "SIGNED_IN",
  UNAUTHORIZED = "UNAUTHORIZED",
  FETCHING = "FETCHING",
  UNKNOWN = "UNKNOWN",
}

export interface AuthorizationState extends EntityState {
  user: UserAuthModel | null;
  authState: AuthState;
}

export function createInitialState(): AuthorizationState {
  return {
    authState: AuthState.UNAUTHORIZED,
    user: null,
  };
}

@StoreConfig({ name: "authorization" })
export class AuthorizationStore extends EntityStore<AuthorizationState> {
  constructor() {
    super(createInitialState());
  }
}

export const authorizationStore = new AuthorizationStore();
