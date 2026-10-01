// Universal Proxy Stub for missing workspace modules
export const api = {};

const proxyModule = new Proxy({}, {
  get: (_, prop) => {
    if (prop === 'default') return api;
    return () => ({ data: [], mutate: () => {}, mutateAsync: async () => {}, isPending: false, isLoading: false });
  }
});

export default proxyModule;

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
