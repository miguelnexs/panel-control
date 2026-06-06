import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useTheme } from '../theme-provider';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  data: number[];
  labels?: string[];
  label?: string;
  color?: string;
  fill?: boolean;
}

export const ActivityChart: React.FC<ChartProps> = ({ data, labels, label = 'Actividad', color = 'rgba(99, 102, 241, 1)', fill = true }) => {
  const { theme } = useTheme();
  // Check actual theme by inspecting the DOM or using system preference if set to 'system'
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)';
  const ticksColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const tooltipTitleColor = isDark ? '#fff' : '#0f172a';
  const tooltipBodyColor = isDark ? '#cbd5e1' : '#334155';
  const tooltipBorderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: tooltipBg,
        titleColor: tooltipTitleColor,
        bodyColor: tooltipBodyColor,
        borderColor: tooltipBorderColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: ticksColor,
          font: {
            size: 11,
          }
        }
      },
      y: {
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          color: ticksColor,
          font: {
            size: 11,
          },
          callback: (value: any) => value >= 1000 ? `${value / 1000}k` : value,
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
      line: {
        tension: 0.4,
      }
    }
  };

  const chartData = {
    labels: labels || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
          gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.2)');
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0.0)');
          return gradient;
        },
        fill,
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgba(99, 102, 241, 1)',
        pointHoverBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointHoverBorderColor: '#fff',
      },
    ],
  };

  return <Line options={options} data={chartData} />;
};

export const PerformanceChart: React.FC<ChartProps> = ({ data, labels }) => {
  const { theme } = useTheme();
  const isDark = document.documentElement.classList.contains('dark');
  const ticksColor = isDark ? '#94a3b8' : '#64748b';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: ticksColor }
      },
      y: {
        display: false,
      }
    },
    elements: {
      bar: {
        borderRadius: 4,
      }
    }
  };

  const chartData = {
    labels: labels || ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
    datasets: [
      {
        label: 'Rendimiento',
        data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(99, 102, 241, 0.8)',
        ],
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(99, 102, 241, 1)',
        ],
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
};
