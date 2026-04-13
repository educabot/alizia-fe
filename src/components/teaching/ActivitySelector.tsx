import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MOMENT_LABELS } from '@/lib/constants';
import type { Activity, MomentKey } from '@/types';

interface ActivitySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  momentKey: MomentKey;
  activities: Activity[];
  selected: number[];
  onConfirm: (activityIds: number[]) => void;
  maxActivities?: number;
}

export function ActivitySelector({
  open,
  onOpenChange,
  momentKey,
  activities,
  selected,
  onConfirm,
  maxActivities,
}: ActivitySelectorProps) {
  const [tempSelected, setTempSelected] = useState<number[]>(selected);

  const handleToggle = (id: number) => {
    setTempSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (maxActivities && prev.length >= maxActivities) return prev;
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
    onOpenChange(false);
  };

  // Reset temp state when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setTempSelected(selected);
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-lg max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Seleccionar actividades — {MOMENT_LABELS[momentKey]}</DialogTitle>
        </DialogHeader>
        <div className='space-y-2 mt-4 flex-1 overflow-y-auto'>
          {activities.map((activity) => {
            const isSelected = tempSelected.includes(activity.id);
            const isDisabled = !isSelected && maxActivities !== undefined && tempSelected.length >= maxActivities;
            return (
              <label
                key={activity.id}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => !isDisabled && handleToggle(activity.id)}
                  disabled={isDisabled}
                  className='mt-0.5'
                />
                <div className='flex-1 min-w-0'>
                  <span className='font-medium text-gray-800'>{activity.name}</span>
                  {activity.description && <p className='text-sm text-gray-500 mt-1'>{activity.description}</p>}
                </div>
              </label>
            );
          })}
        </div>
        <div className='pt-4 border-t mt-4'>
          <Button onClick={handleConfirm} className='w-full cursor-pointer'>
            Confirmar seleccion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
