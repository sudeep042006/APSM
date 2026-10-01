// ── Chart Card ───────────────────────────────────────────────────────
// Standard chart container: title, optional subtitle/badge, and a
// render-or-explain gate. Centralising this is what makes every chart in the
// product behave identically when it has no data.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartEmptyState from "./ChartEmptyState";
import { resolveChartState } from "./chartTheme";

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} [props.badge]         small pill on the right of the header
 * @param {Array} [props.data]                    series data
 * @param {string|string[]} [props.valueKeys]     keys that must be non-zero to render
 * @param {string} [props.technical]              API-level reason shown when empty
 * @param {number} [props.height]                 reserved height for the plot
 * @param {React.ReactNode} [props.actions]       interactive controls in the header
 * @param {Function} [props.children]             render prop: (data) => ReactNode
 */
export default function ChartCard({
  title,
  subtitle,
  icon,
  badge,
  data,
  valueKeys,
  technical,
  height = 280,
  emptyMessages,
  actions,
  children,
  className = "",
  contentClassName = "",
}) {
  const state = resolveChartState(data, valueKeys, emptyMessages || {});

  return (
    <Card className={`surface-card flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              {icon}
              <span className="truncate">{title}</span>
            </CardTitle>
            {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {actions || badge}
        </div>
      </CardHeader>

      <CardContent className={`flex-1 ${contentClassName}`}>
        {state.empty ? (
          <ChartEmptyState
            title={state.title}
            detail={state.detail}
            technical={technical}
            height={height}
          />
        ) : (
          children(state.data)
        )}
      </CardContent>
    </Card>
  );
}
