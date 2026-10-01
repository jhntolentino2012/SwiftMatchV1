export const api = {};
export default api;

export class Analytics {
  track() {}
}

// Universal Proxy to handle any remaining or future imports
export const __esModule = true;
export default new Proxy({}, {
  get: (_, prop) => {
    if (prop === 'default') return api;
    return () => ({ data: [], mutate: () => {}, mutateAsync: async () => {}, isPending: false, isLoading: false });
  }
});

// Explicit exports including setAuthTokenGetter
export const setAuthTokenGetter = (fn: any) => {};
export const useCreateApplicant = () => ({ mutate: () => {}, mutateAsync: async () => {}, isPending: false, isLoading: false });
export const useGetApplicants = () => ({ data: [], isLoading: false });
export const useUpdateApplicant = () => ({ mutate: () => {}, isPending: false });
export const useListJobs = () => ({ data: [], isLoading: false });
export const useListCourses = () => ({ data: [], isLoading: false });
export const useListAssessments = () => ({ data: [], isLoading: false });
export const useSubmitAssessment = () => ({ mutate: () => {}, isPending: false });

export type Job = any;
export type Course = any;
export type Assessment = any;
export type Applicant = any;
