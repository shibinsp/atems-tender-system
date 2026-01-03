import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

// Color palette for charts
const COLORS = [
  '#1e3a5f', // Primary navy
  '#c53030', // Government red
  '#d69e2e', // Gold
  '#38a169', // Green
  '#3182ce', // Blue
  '#805ad5', // Purple
  '#dd6b20', // Orange
  '#319795', // Teal
  '#e53e3e', // Red
  '#718096'  // Gray
];

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  height = 300
}) => (
  <div className="bg-white rounded-lg shadow-govt p-5">
    <div className="mb-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
    <div style={{ height }}>{children}</div>
  </div>
);

// Bar Chart Component
interface BarChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  horizontal?: boolean;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  color = COLORS[0],
  horizontal = false
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={data}
      layout={horizontal ? 'vertical' : 'horizontal'}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      {horizontal ? (
        <>
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis dataKey={xAxisKey} type="category" tick={{ fontSize: 12 }} width={100} />
        </>
      ) : (
        <>
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
        </>
      )}
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

// Grouped Bar Chart
interface GroupedBarChartProps {
  data: any[];
  bars: { dataKey: string; name: string; color?: string }[];
  xAxisKey?: string;
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  bars,
  xAxisKey = 'name'
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Legend />
      {bars.map((bar, index) => (
        <Bar
          key={bar.dataKey}
          dataKey={bar.dataKey}
          name={bar.name}
          fill={bar.color || COLORS[index % COLORS.length]}
          radius={[4, 4, 0, 0]}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

// Pie Chart Component
interface PieChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface SimplePieChartProps {
  data: PieChartData[];
  showLabels?: boolean;
  innerRadius?: number;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  showLabels = true,
  innerRadius = 0
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={innerRadius}
        outerRadius={80}
        paddingAngle={2}
        dataKey="value"
        label={showLabels ? ({ name, percent }: any) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)` : undefined}
        labelLine={showLabels}
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

// Line Chart Component
interface LineChartData {
  name: string;
  [key: string]: string | number;
}

interface SimpleLineChartProps {
  data: LineChartData[];
  lines: { dataKey: string; name: string; color?: string }[];
  xAxisKey?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  lines,
  xAxisKey = 'name'
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Legend />
      {lines.map((line, index) => (
        <Line
          key={line.dataKey}
          type="monotone"
          dataKey={line.dataKey}
          name={line.name}
          stroke={line.color || COLORS[index % COLORS.length]}
          strokeWidth={2}
          dot={{ fill: line.color || COLORS[index % COLORS.length], strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </LineChart>
  </ResponsiveContainer>
);

// Area Chart Component
interface SimpleAreaChartProps {
  data: LineChartData[];
  areas: { dataKey: string; name: string; color?: string }[];
  xAxisKey?: string;
  stacked?: boolean;
}

export const SimpleAreaChart: React.FC<SimpleAreaChartProps> = ({
  data,
  areas,
  xAxisKey = 'name',
  stacked = false
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Legend />
      {areas.map((area, index) => (
        <Area
          key={area.dataKey}
          type="monotone"
          dataKey={area.dataKey}
          name={area.name}
          stackId={stacked ? 'stack' : undefined}
          stroke={area.color || COLORS[index % COLORS.length]}
          fill={area.color || COLORS[index % COLORS.length]}
          fillOpacity={0.3}
        />
      ))}
    </AreaChart>
  </ResponsiveContainer>
);

// Progress Bar Component
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = '#1e3a5f',
  size = 'md'
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span className="text-gray-700">{label}</span>}
          {showPercentage && <span className="text-gray-500">{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// Data Table Component
interface DataTableColumn {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  emptyMessage?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  emptyMessage = 'No data available'
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-gray-200">
          {columns.map(col => (
            <th
              key={col.key}
              className={`py-3 px-4 font-semibold text-gray-700 text-${col.align || 'left'}`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="py-8 text-center text-gray-500">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              {columns.map(col => (
                <td
                  key={col.key}
                  className={`py-3 px-4 text-${col.align || 'left'}`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export { COLORS };
