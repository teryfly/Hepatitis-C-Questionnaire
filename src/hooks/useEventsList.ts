import { useQuery } from "@tanstack/react-query";
import { getEventsList } from "../services/events";

export function useEventsList(filters: any) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => getEventsList(filters),
    keepPreviousData: true,
  });
}