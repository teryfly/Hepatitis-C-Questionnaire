import { useQuery } from "@tanstack/react-query";
import { getTrackedEntitiesList } from "../services/trackedEntities";

export function useTrackedEntitiesList(filters: any) {
  return useQuery({
    queryKey: ["trackedEntities", filters],
    queryFn: () => getTrackedEntitiesList(filters),
    keepPreviousData: true,
  });
}