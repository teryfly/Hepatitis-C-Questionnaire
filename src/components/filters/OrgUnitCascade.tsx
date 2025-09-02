import React, { useEffect, useState } from "react";
import { useOrgUnitsCascade } from "../../hooks/useOrgUnitsCascade";

interface OrgUnitCascadeProps {
  value: string[];
  onChange: (orgUnits: string[]) => void;
}

const OrgUnitCascade: React.FC<OrgUnitCascadeProps> = ({ value, onChange }) => {
  const { levels, loading, loadChildren } = useOrgUnitsCascade();
  const [selected, setSelected] = useState<string[]>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleChange = (level: number, id: string) => {
    const newSelected = [...selected.slice(0, level), id];
    setSelected(newSelected);
    onChange(newSelected);
    loadChildren(id, level);
  };

  return (
    <span style={{ display: "inline-flex", gap: 8 }}>
      {levels.map((opts, idx) => (
        <select
          key={idx}
          value={selected[idx] || ""}
          onChange={e => handleChange(idx, e.target.value)}
          disabled={loading || opts.length === 0}
        >
          <option value="">{idx === 0 ? "报告地区" : "下级单位"}</option>
          {opts.map(org => (
            <option key={org.id} value={org.id}>{org.displayName}</option>
          ))}
        </select>
      ))}
    </span>
  );
};

export default OrgUnitCascade;