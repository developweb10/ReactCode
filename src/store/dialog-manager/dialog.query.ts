import { Query } from "@datorama/akita";
import {
  DialogManagerState,
  DialogManagerStore,
  dialogManagerStore,
} from "./dialog.store";

export class DialogManagerQuery extends Query<DialogManagerState> {
  dialogs$ = this.select((state) => state.dialogs);
  constructor(protected store: DialogManagerStore) {
    super(store);
  }
}

export const dialogManagerQuery = new DialogManagerQuery(dialogManagerStore);
