import { QueryClient, MutationCache } from "@tanstack/react-query";

/**
 * Query-key prefixes whose data is an aggregate/rollup of many domains
 * (leads, appointments, campaigns, contacts, doctors, knowledge, billing …).
 * A successful mutation anywhere in the app can change these, but the feature
 * hooks only invalidate their own domain keys — so the dashboard would keep
 * showing stale numbers until a manual refresh. Refresh them centrally instead.
 *
 * `invalidateQueries` only refetches *active* (mounted) queries; when the
 * dashboard is not on screen its query is just marked stale and refetches the
 * next time it mounts — so this costs no extra network while you're elsewhere.
 */
const AGGREGATE_QUERY_KEYS: readonly (readonly string[])[] = [
  ["whatsapp-dashboard"],
  ["weekly-summary"],
  ["super-admin-dashboard"],
];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: () => {
      AGGREGATE_QUERY_KEYS.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [...queryKey] });
      });
    },
  }),
});
