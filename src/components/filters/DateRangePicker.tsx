import React from "react";

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  return (
    <span style={{ display: "inline-flex", gap: 4, marginLeft: 8 }}>
      <input
        type="date"
        value={value?.start || ""}
        onChange={e => onChange({ start: e.target.value, end: value?.end || "" })}
        style={{ width: 140 }}
      />
      <span>-</span>
      <input
        type="date"
        value={value?.end || ""}
        onChange={e => onChange({ start: value?.start || "", end: e.target.value })}
        style={{ width: 140 }}
      />
    </span>
  );
};

export default DateRangePicker;