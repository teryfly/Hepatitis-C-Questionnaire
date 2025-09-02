import React, { useEffect, useMemo, useState } from "react";
import { FiltersBar } from "../../components/filters/FiltersBar";
import { ActionBar } from "../../components/actions/ActionBar";
import { SelectionInfo } from "../../components/info/SelectionInfo";
import { TableContainer } from "../../components/table/TableContainer";
import { useEventsList } from "../../hooks/useEventsList";
import { usePrograms } from "../../hooks/usePrograms";

export const EventListView: React.FC<{ selectedProgramId: string }> = ({ selectedProgramId }) => {
  const [filters, setFilters] = useState<any>({ programId: selectedProgramId });
  const { data: programsRaw, isLoading: loadingPrograms } = usePrograms("WITHOUT_REGISTRATION");

  // 仅允许选择当前选中的项目（保持一致性）
  const programs = useMemo(
    () => (programsRaw || []).filter((p: any) => p.id === selectedProgramId),
    [programsRaw, selectedProgramId]
  );

  useEffect(() => {
    setFilters((prev: any) => ({ ...prev, programId: selectedProgramId }));
  }, [selectedProgramId]);

  const { data, isLoading, refetch } = useEventsList(filters);

  return (
    <div className="event-list-view">
      <FiltersBar
        type="event"
        programs={programs}
        isLoading={loadingPrograms}
        filters={filters}
        onChange={(f) => setFilters({ ...f, programId: selectedProgramId })}
        onSearch={refetch}
      />
      <ActionBar type="event" filters={filters} onRefresh={refetch} />
      <SelectionInfo />
      <TableContainer
        type="event"
        data={data?.events || []}
        loading={isLoading}
        onRefresh={refetch}
        filters={{ ...filters, pager: data?.pager }}
      />
    </div>
  );
};