export const api = {};
export default api;

export class Analytics {
  track() {}
}

// Stub hooks for API client
export const useCreateApplicant = () => ({ mutate: () => {}, mutateAsync: async () => {}, isPending: false, isLoading: false });
export const useGetApplicants = () => ({ data: [], isLoading: false });
export const useUpdateApplicant = () => ({ mutate: () => {}, isPending: false });
