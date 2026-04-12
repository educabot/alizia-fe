import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  onClick?: () => void;
}

export function StatsCard({ icon: Icon, label, value, sublabel, onClick }: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#E4E8EF] rounded-2xl p-4 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''
      }`}
    >
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-lg bg-primary/10 text-primary shrink-0'>
          <Icon className='w-5 h-5' />
        </div>
        <div>
          <p className='text-2xl font-bold text-gray-900'>{value}</p>
          <p className='text-sm text-gray-500'>{label}</p>
          {sublabel && <p className='text-xs text-gray-400 mt-0.5'>{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}
