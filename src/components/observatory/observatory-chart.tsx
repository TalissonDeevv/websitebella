import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PublicMetricSeriesPoint } from "@/lib/public-platform";

function dayLabel(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" })
    .format(date)
    .replace(".", "");
}

export function ObservatoryChart({ data }: { data: PublicMetricSeriesPoint[] }) {
  if (!data.length) {
    return (
      <div className="observatory-empty observatory-chart-empty">
        <span>Histórico em preparação</span>
        <p>
          O gráfico aparecerá quando a Bella enviar pontos agregados para o período selecionado.
        </p>
      </div>
    );
  }
  return (
    <div
      className="observatory-chart"
      role="img"
      aria-label="Evolução de interações, comandos e ações de segurança"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="bellaInteractions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--bella-rose)" stopOpacity={0.38} />
              <stop offset="95%" stopColor="var(--bella-rose)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bellaCommands" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--bella-gold)" stopOpacity={0.26} />
              <stop offset="95%" stopColor="var(--bella-gold)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={dayLabel}
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            allowDecimals={false}
          />
          <Tooltip
            labelFormatter={(label) => dayLabel(String(label))}
            contentStyle={{
              background: "oklch(0.145 0.018 15)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--foreground)",
            }}
          />
          <Area
            type="monotone"
            dataKey="interactions"
            name="Interações"
            stroke="var(--bella-rose)"
            fill="url(#bellaInteractions)"
            strokeWidth={2}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="commands"
            name="Comandos"
            stroke="var(--bella-gold)"
            fill="url(#bellaCommands)"
            strokeWidth={1.5}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="securityActions"
            name="Proteção"
            stroke="oklch(0.72 0.13 145)"
            fill="transparent"
            strokeWidth={1.5}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
