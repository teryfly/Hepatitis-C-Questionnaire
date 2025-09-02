import React, { useEffect, useMemo, useState } from "react";
import { FiltersBar } from "../../components/filters/FiltersBar";
import { ActionBar } from "../../components/actions/ActionBar";
import { SelectionInfo } from "../../components/info/SelectionInfo";
import { TableContainer } from "../../components/table/TableContainer";
import { useTrackedEntitiesList } from "../../hooks/useTrackedEntitiesList";
import { usePrograms } from "../../hooks/usePrograms";

export const TrackedListView: React.FC<{ selectedProgramId: string }> = ({ selectedProgramId }) => {
  const [filters, setFilters] = useState<any>({ programId: selectedProgramId });
  const { data: programsRaw, isLoading: loadingPrograms } = usePrograms("WITH_REGISTRATION");

  const programs = useMemo(
    () => (programsRaw || []).filter((p: any) => p.id === selectedProgramId),
    [programsRaw, selectedProgramId]
  );

  useEffect(() => {
    setFilters((prev: any) => ({ ...prev, programId: selectedProgramId }));
  }, [selectedProgramId]);

  const { data, isLoading, refetch } = useTrackedEntitiesList(filters);

  return (
    <div className="tracked-list-view">
      <FiltersBar
        type="tracked"
        programs={programs}
        isLoading={loadingPrograms}
        filters={filters}
        onChange={(f) => setFilters({ ...f, programId: selectedProgramId })}
        onSearch={refetch}
      />
      <ActionBar type="tracked" filters={filters} onRefresh={refetch} />
      <SelectionInfo />
      <TableContainer
        type="tracked"
        data={data?.trackedEntities || []}
        loading={isLoading}
        onRefresh={refetch}
        filters={{ ...filters, pager: data?.pager }}
      />
    </div>
  );
};