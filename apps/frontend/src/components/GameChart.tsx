import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Props = {
  data: Record<string, number>;
};

export const GameChart = ({ data }: Props) => {
  const labels = Object.keys(data);
  const values = Object.values(data);

  return (
    <div className="w-full">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Playtime (hours)",
              data: values,
              backgroundColor: 'rgba(139, 92, 246, 0.8)',
              borderColor: 'rgba(139, 92, 246, 1)',
              borderWidth: 1,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              titleColor: '#f1f5f9',
              bodyColor: '#cbd5e1',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: '#94a3b8',
                font: {
                  size: 12,
                },
              },
            },
            y: {
              grid: {
                color: 'rgba(148, 163, 184, 0.1)',
              },
              ticks: {
                color: '#94a3b8',
                font: {
                  size: 12,
                },
              },
            },
          },
        }}
      />
    </div>
  );
};
