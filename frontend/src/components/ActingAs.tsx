import type { Staff } from '../types';

interface Props {
  staff: Staff[];
  value: string;
  onChange: (name: string) => void;
}

export function ActingAs({ staff, value, onChange }: Props) {
  return (
    <label className="flex w-full items-center gap-3 text-meta text-ink-muted sm:w-auto">
      <span className="whitespace-nowrap">Acting as</span>
      <select
        className="field-input py-1.5 text-meta sm:w-auto"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={staff.length === 0}
      >
        {staff.length === 0 && <option value="">Loading staff…</option>}
        {staff.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}, {s.section}
          </option>
        ))}
      </select>
    </label>
  );
}
