interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  unit: string;
  colorClass: 'blue' | 'green' | 'purple';
}

export const MetricCard = ({ icon, label, value, unit, colorClass }: MetricCardProps) => {
  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600' },
  };
  const color = colors[colorClass];

  return (
    <div className={`${color.bg} rounded-lg p-6 text-center border ${color.border}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${color.text}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-1">{unit}</div>
    </div>
  );
};

