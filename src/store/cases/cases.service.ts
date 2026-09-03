import {
  applyTransaction,
  arrayAdd,
  arrayRemove,
  arrayUpdate,
} from "@datorama/akita";
import { CasesStore, casesStore } from "./cases.store";

import { MessagesApi } from "@api/messages/messages.api";
import { CasesApi } from "@api/cases/cases.api";
import {
  CasesFetchParams,
  InvestigationCasesFetchParams,
  DisciplinaryCasesFetchParams,
  LTSCasesFetchParams,
  GrievanceCasesFetchParams,
  AppealCasesFetchParams,
  PerformanceCasesFetchParams,
} from "@models/cases.models";
import { AddMessageDto } from "@models/message.models";

import { snackbarService } from "@store/snackbar/snackbar.service";

export class CasesService {
  constructor(private casesStore: CasesStore) {}

  async fetchCases({
    size = 20,
    page = 1,
    sort = "",
    ...rest
  }: CasesFetchParams) {
    this.casesStore.setLoading(true);
    try {
      const response = await CasesApi.fetchCases({
        size,
        page: page - 1,
        sort: sort || "id,desc",
        ...rest,
      });
      applyTransaction(() => {
        this.casesStore.set(response.data.result);
        this.casesStore.update({
          ui: {
            pagesCount: Math.ceil(response.data.total / size),
          },
          total: response.data.total,
        });
        this.casesStore.setLoading(false);
      });
    } catch (error) {
      applyTransaction(() => {
        this.casesStore.set([]);
        this.casesStore.update({
          ui: {
            pagesCount: 0,
          },
          total: 0,
        });
        this.casesStore.setLoading(false);
      });
    }
  }

  async fetchInvestigationCases({
    size = 20,
    page = 1,
    sort = "",
    ...rest
  }: InvestigationCasesFetchParams) {
    this.casesStore.setLoading(true);
    try {
      const response = await CasesApi.fetchInvestigationCases({
        size,
        page: page - 1,
        sort: sort || "id,desc",
        ...rest,
      });
      applyTransaction(() => {
        this.casesStore.set(response.data.result);
        this.casesStore.update({
          ui: {
            pagesCount: Math.ceil(response.data.total / size),
          },
          total: response.data.total,
        });
        this.casesStore.setLoading(false);
      });
    } catch (error) {
      applyTransaction(() => {
        this.casesStore.set([]);
        this.casesStore.update({
          ui: {
            pagesCount: 0,
          },
          total: 0,
        });
        this.casesStore.setLoading(false);
      });
    }
  }

  async fetchDisciplinaryCases({
    size = 20,
    page = 1,
    sort = "",
    ...rest
  }: DisciplinaryCasesFetchParams) {
    this.casesStore.setLoading(true);
    try {
      const response = await CasesApi.fetchDisciplinaryCases({
        size,
        page: page - 1,
        sort: sort || "id,desc",
        ...rest,
      });
      applyTransaction(() => {
        this.casesStore.set(response.data.result);
        this.casesStore.update({
          ui: {
            pagesCount: Math.ceil(response.data.total / size),
          },
          total: response.data.total,
        });
        this.casesStore.setLoading(false);
      });
    } catch (error) {
      applyTransaction(() => {
        this.casesStore.set([]);
        this.casesStore.update({
          ui: {
            pagesCount: 0,
          },
          total: 0,
        });
        this.casesStore.setLoading(false);
      });
    }
  }

  async fetchLTSCases({
    size = 20,
    page = 1,
    sort = "",
    ...rest
  }: LTSCasesFetchParams) {
    this.casesStore.setLoading(true);
    try {
      const response = await CasesApi.fetchLTSCases({
        size,
        page: page - 1,
        sort: sort || "id,desc",
        ...rest,
      });
      applyTransaction(() => {
        this.casesStore.set(response.data.result);
        this.casesStore.update({
          ui: {
            pagesCount: Math.ceil(response.data.total / size),
          },
          total: response.data.total,
        });
        this.casesStore.setLoading(false);
      });
    } catch (error) {
      applyTransaction(() => {
        this.casesStore.set([]);
        this.casesStore.update({
          ui: {
            pagesCount: 0,
          },
          total: 0,
        });
        this.casesStore.setLoading(false);
      });
    }
  }

  async fetchGrievanceCases({
    size = 20,
    page = 1,
    sort = "",
    ...rest
  }: GrievanceCasesFetchParams) {
    this.casesStore.setLoading(true);
    try {
      const response = await CasesApi.fetchGrievanceCases({
        size,
        page: page - 1,
        sort: sort || "id,desc",
        ...rest,
      });
      applyTransaction(() => {
        this.casesStore.set(response.data.result);
        this.casesStore.update({
          ui: {
            pagesCount: Math.ceil(response.data.total / size),
          },
          total: response.data.total,
        });
        this.casesStore.setLoading(false);
      });
    } catch (error) {
      applyTransaction(() => {
        this.casesStore.set([]);
        this.casesStore.update({
          ui: {
            pagesCount: 0,
          },
          total: 0,
        });
        this.casesStore.setLoading(false);
      });
    }
  }

  async fetchAppealCases({
    size = 20,
    page = 1,
    sort = "",
    ...rest
  }: AppealCasesFetchParams) {
    this.casesStore.setLoading(true);
    try {
      const response = await CasesApi.fetchAppealCases({
        size,
        page: page - 1,
        sort: sort || "id,desc",
        ...rest,
      });
      applyTransaction(() => {
        this.casesStore.set(response.data.result);
        this.casesStore.update({
          ui: {
            pagesCount: Math.ceil(response.data.total / size),
          },
          total: response.data.total,
        });
        this.casesStore.setLoading(false);
      });
    } catch (error) {
      applyTransaction(() => {
        this.casesStore.set([]);
        this.casesStore.update({
          ui: {
            pagesCount: 0,
          },
          total: 0,
        });
        this.casesStore.setLoading(false);
      });
    }
  }

  async fetchPerformanceCases({
    size = 20,
    page = 1,
    sort = "",
    ...rest
  }: PerformanceCasesFetchParams) {
    this.casesStore.setLoading(true);
    try {
      const response = await CasesApi.fetchPerformanceCases({
        size,
        page: page - 1,
        sort: sort || "id,desc",
        ...rest,
      });
      applyTransaction(() => {
        this.casesStore.set(response.data.result);
        this.casesStore.update({
          ui: {
            pagesCount: Math.ceil(response.data.total / size),
          },
          total: response.data.total,
        });
        this.casesStore.setLoading(false);
      });
    } catch (error) {
      applyTransaction(() => {
        this.casesStore.set([]);
        this.casesStore.update({
          ui: {
            pagesCount: 0,
          },
          total: 0,
        });
        this.casesStore.setLoading(false);
      });
    }
  }

  async addCase<T>(dto: T) {
    try {
      await CasesApi.addCase(dto);

      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Added Case",
      });
    } catch (error) {
      throw error;
    }
  }

  async updateCase<T>(dto: T, caseId: number) {
    try {
      const response = await CasesApi.updateCase(dto, caseId);

      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Updated Case",
      });

      this.casesStore.replace(caseId, response.data);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async removeCase(id: number) {
    try {
      await CasesApi.removeCase(id);
    } catch (error) {
      throw error;
    }
  }

  async addMessage(caseId: number, dto: AddMessageDto) {
    try {
      const response = await CasesApi.addMessage(caseId, dto);
      this.casesStore.update(caseId, ({ messageDtos }) => ({
        messageDtos: arrayAdd(messageDtos, response.data, { prepend: true }),
      }));
      snackbarService.upsertNotification({
        status: "success",
        message: "Successfully Added Message",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage(id: number, caseId: number) {
    try {
      await MessagesApi.deleteMessage(id);
      this.casesStore.update(caseId, ({ messageDtos }) => ({
        messageDtos: arrayRemove(messageDtos, id),
      }));
      snackbarService.upsertNotification({
        status: "success",
        message: "Message Has Been Deleted",
      });
    } catch (error) {
      throw error;
    }
  }

  async updateMessage(id: number, message: string, caseId: number) {
    try {
      const response = await MessagesApi.updateMessage(id, message);
      this.casesStore.update(caseId, ({ messageDtos }) => ({
        messageDtos: arrayUpdate(messageDtos, id, response.data),
      }));
      snackbarService.upsertNotification({
        status: "success",
        message: "Message Has Been Updated",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const casesService = new CasesService(casesStore);
