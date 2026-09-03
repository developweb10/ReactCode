import { ApiServiceInstance } from "../api-service";
import {
  CaseTableModel,
  CasesFetchParams,
  CaseOutcomeDto,
  CaseAilmentDto,
  CaseType,
  InvestigationCasesFetchParams,
  DisciplinaryCasesFetchParams,
  LTSCasesFetchParams,
  GrievanceCasesFetchParams,
  AppealCasesFetchParams,
  PerformanceCasesFetchParams,
} from "@models/cases.models";
import { AddMessageDto, MessageModel } from "@models/message.models";

export class CasesApi {
  static async fetchCases(params: CasesFetchParams) {
    return await ApiServiceInstance.get<{
      result: CaseTableModel[];
      total: number;
    }>(`/private/cases/`, {
      params,
    });
  }

  static async fetchInvestigationCases(params: InvestigationCasesFetchParams) {
    return await ApiServiceInstance.get<{
      result: CaseTableModel[];
      total: number;
    }>(`/private/investigation-cases`, {
      params,
    });
  }

  static async fetchDisciplinaryCases(params: DisciplinaryCasesFetchParams) {
    return await ApiServiceInstance.get<{
      result: CaseTableModel[];
      total: number;
    }>(`/private/disciplinary-cases`, {
      params,
    });
  }

  static async fetchLTSCases(params: LTSCasesFetchParams) {
    return await ApiServiceInstance.get<{
      result: CaseTableModel[];
      total: number;
    }>(`/private/lts-cases`, {
      params,
    });
  }

  static async fetchGrievanceCases(params: GrievanceCasesFetchParams) {
    return await ApiServiceInstance.get<{
      result: CaseTableModel[];
      total: number;
    }>(`/private/grievance-cases`, {
      params,
    });
  }

  static async fetchAppealCases(params: AppealCasesFetchParams) {
    return await ApiServiceInstance.get<{
      result: CaseTableModel[];
      total: number;
    }>(`/private/appeals-cases`, {
      params,
    });
  }

  static async fetchPerformanceCases(params: PerformanceCasesFetchParams) {
    return await ApiServiceInstance.get<{
      result: CaseTableModel[];
      total: number;
    }>(`/private/performance-cases`, {
      params,
    });
  }

  static async fetchCaseById(caseId: number) {
    return await ApiServiceInstance.get<CaseTableModel>(
      `/private/cases/${caseId}`
    );
  }

  static async addCase<T>(dto: T) {
    return await ApiServiceInstance.post<CaseTableModel>(
      `/private/cases/`,
      dto
    );
  }

  static async updateCase<T>(dto: T, caseId: number) {
    return await ApiServiceInstance.put<CaseTableModel>(
      `/private/cases/${caseId}`,
      dto
    );
  }

  static async removeCase(id: number) {
    return await ApiServiceInstance.delete(`/private/cases/${id}`);
  }

  static async addMessage(caseId: number, dto: AddMessageDto) {
    return await ApiServiceInstance.post<MessageModel>(
      `/private/cases/${caseId}/messages`,
      dto
    );
  }

  static async getCaseOutcomes(caseTypeId: CaseType) {
    return await ApiServiceInstance.get<{
      result: CaseOutcomeDto[];
      total: number;
    }>(`/private/case_outcomes`, {
      params: {
        caseTypeId,
      },
    });
  }

  static async getCaseAilments(searchQuery?: string) {
    return await ApiServiceInstance.get<{
      result: CaseAilmentDto[];
      total: number;
    }>(`/private/case_ailments`, {
      params: {
        searchQuery,
      },
    });
  }
}
