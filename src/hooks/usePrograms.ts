import { useQuery } from "@tanstack/react-query";
import { getPrograms } from "../services/programs";

export function usePrograms(programType: "WITHOUT_REGISTRATION" | "WITH_REGISTRATION") {
  return useQuery({
    queryKey: ["programs", programType],
    queryFn: () => getPrograms(programType),
    keepPreviousData: true,
  });
}