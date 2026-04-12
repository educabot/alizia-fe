import { Textarea } from '@/components/ui/textarea';
import type { ProfileField } from '@/types';

interface ProfileFormProps {
  fields: ProfileField[];
  values: Record<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
}

export function ProfileForm({ fields, values, onChange }: ProfileFormProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className='space-y-5'>
      {fields.map((field) => (
        <div key={field.key} className='space-y-1.5'>
          <label className='text-sm font-medium text-gray-700'>
            {field.label}
            {field.required && <span className='text-red-500 ml-1'>*</span>}
          </label>

          {field.type === 'text' && (
            <Textarea
              value={String(values[field.key] || '')}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={`Ingresa ${field.label.toLowerCase()}...`}
              className='min-h-16 resize-none'
            />
          )}

          {field.type === 'select' && field.options && (
            <select
              value={String(values[field.key] || '')}
              onChange={(e) => onChange(field.key, e.target.value)}
              className='w-full px-3 py-2 border border-[#E4E8EF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white'
            >
              <option value=''>Seleccionar...</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {field.type === 'multiselect' && field.options && (
            <div className='flex flex-wrap gap-2'>
              {field.options.map((opt) => {
                const selected = Array.isArray(values[field.key]) && (values[field.key] as string[]).includes(opt);
                return (
                  <button
                    key={opt}
                    type='button'
                    onClick={() => {
                      const current = Array.isArray(values[field.key]) ? (values[field.key] as string[]) : [];
                      const next = selected ? current.filter((v) => v !== opt) : [...current, opt];
                      onChange(field.key, next);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      selected
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 border border-[#E4E8EF] hover:border-primary/40'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
