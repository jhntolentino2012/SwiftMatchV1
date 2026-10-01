export const api = {};
export default api;

export class Analytics {
  track() {}
}

// Stub hooks and types for API client
export const useCreateApplicant = () => ({ mutate: () => {}, mutateAsync: async () => {}, isPending: false, isLoading: false });
export const useGetApplicants = () => ({ data: [], isLoading: false });
export const useUpdateApplicant = () => ({ mutate: () => {}, isPending: false });
export const useListJobs = () => ({ data: [], isLoading: false });
export const useListCourses = () => ({ data: [], isLoading: false });

export type Job = any;
export type Course = any;
