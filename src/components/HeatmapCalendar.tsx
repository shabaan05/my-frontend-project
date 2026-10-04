import type { DayStat } from '../utils/dateUtils';

interface Props {
  days: DayStat[];
  selectedDateKey: string | null;
  onSelectDay: (dateKey: string) => void;
}

function getCellStyle(d: DayStat): { bg: string; border: string } {
  if (d.isFuture) return { bg: '#f8fafc', border: '#e2e8f0' };
  if (d.pct === 0) return { bg: '#f1f5f9', border: '#e2e8f0' };
  if (d.pct < 40)  return { bg: '#fecaca', border: '#fca5a5' };
  if (d.pct < 70)  return { bg: '#fde68a', border: '#fcd34d' };
  if (d.pct < 100) return { bg: '#a5f3fc', border: '#67e8f9' };
  return                  { bg: '#6ee7b7', border: '#34d399' };
}

export default function HeatmapCalendar({ days, selectedDateKey, onSelectDay }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {days.map((d) => {
          const { bg, border } = getCellStyle(d);
          const isSelected = d.dateKey === selectedDateKey;

          return (
            <button
              key={d.dateKey}
              disabled={d.isFuture}
              onClick={() => !d.isFuture && onSelectDay(d.dateKey)}
              title={
                d.isFuture
                  ? d.dateKey
                  : `${d.dayName} ${d.dayNum} — ${d.pct}% (${d.completed}/${d.total})`
              }
              aria-label={
                d.isFuture
                  ? `Future: ${d.dateKey}`
                  : `${d.dateKey}: ${d.pct}% completion`
              }
              aria-pressed={isSelected}
              className="relative aspect-square rounded-lg flex flex-col items-center justify-center transition-transform motion-reduce:transition-none hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              style={{
                background: bg,
                border: `2px solid ${isSelected ? '#7c3aed' : border}`,
                transform: isSelected ? 'scale(1.1)' : undefined,
                cursor: d.isFuture ? 'not-allowed' : 'pointer',
              }}
            >
              <span
                className="text-[10px] font-semibold leading-none"
                style={{ color: d.isFuture ? '#cbd5e1' : d.pct === 0 ? '#94a3b8' : '#374151' }}
              >
                {d.dayNum}
              </span>
              {d.isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { bg: '#6ee7b7', label: '100%'   },
          { bg: '#a5f3fc', label: '70–99%' },
          { bg: '#fde68a', label: '40–69%' },
          { bg: '#fecaca', label: '1–39%'  },
          { bg: '#f1f5f9', label: 'None'   },
          { bg: '#f8fafc', label: 'Future', border: '#e2e8f0' },
        ].map(({ bg, label, border }) => (
          <span key={label} className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="w-3 h-3 rounded shrink-0" style={{ background: bg, border: `1px solid ${border ?? bg}` }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
