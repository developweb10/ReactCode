import {QueryEntity} from "@datorama/akita";
import {AuthorizationState, AuthorizationStore, authorizationStore} from "./authorization.store";

export class AuthorizationQuery extends QueryEntity<AuthorizationState> {

    user$ = this.select(store => store.user);
    authState$ = this.select((state) => state.authState);

    constructor(protected store: AuthorizationStore) {
        super(store);
    }
}

export const authorizationQuery = new AuthorizationQuery(authorizationStore);
