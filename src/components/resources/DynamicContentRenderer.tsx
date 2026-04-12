import { Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

/**
 * Schema field definition from ResourceType.output_schema.
 * - string fields: { type: 'string', label: 'Titulo' }
 * - array fields:  { type: 'array', label: 'Secciones', items: { heading: {...}, content: {...} } }
 */
interface SchemaField {
  type: 'string' | 'array';
  label?: string;
  items?: Record<string, SchemaField>;
}

type OutputSchema = Record<string, SchemaField>;

interface DynamicContentRendererProps {
  schema: OutputSchema;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function DynamicContentRenderer({ schema, content, onChange, readOnly }: DynamicContentRendererProps) {
  const keys = Object.keys(schema);

  if (keys.length === 0) {
    return <p className='text-sm text-gray-400 italic'>Sin esquema definido para este tipo de recurso</p>;
  }

  const handleFieldChange = (key: string, value: unknown) => {
    onChange({ ...content, [key]: value });
  };

  return (
    <div className='space-y-6'>
      {keys.map((key) => {
        const field = schema[key];
        if (!field) return null;

        if (field.type === 'array' && field.items) {
          return (
            <ArrayField
              key={key}
              fieldKey={key}
              field={field}
              items={(content[key] as Record<string, unknown>[] | undefined) || []}
              onChange={(items) => handleFieldChange(key, items)}
              readOnly={readOnly}
            />
          );
        }

        return (
          <StringField
            key={key}
            label={field.label || key}
            value={String(content[key] || '')}
            onChange={(v) => handleFieldChange(key, v)}
            readOnly={readOnly}
          />
        );
      })}
    </div>
  );
}

// --- String field ---

function StringField({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className='space-y-1.5'>
      <label className='text-sm font-medium text-gray-700'>{label}</label>
      {readOnly ? (
        <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3'>
          {value || <span className='text-gray-400 italic'>Sin contenido</span>}
        </p>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='min-h-20 resize-none'
          placeholder={`Ingresa ${label.toLowerCase()}...`}
        />
      )}
    </div>
  );
}

// --- Array field (e.g. sections, questions) ---

function ArrayField({
  fieldKey,
  field,
  items,
  onChange,
  readOnly,
}: {
  fieldKey: string;
  field: SchemaField;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
  readOnly?: boolean;
}) {
  const itemSchema = field.items!;

  const handleItemChange = (index: number, itemKey: string, value: string) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [itemKey]: value } : item));
    onChange(updated);
  };

  const handleAdd = () => {
    const empty: Record<string, unknown> = {};
    for (const k of Object.keys(itemSchema)) {
      empty[k] = '';
    }
    onChange([...items, empty]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <label className='text-sm font-medium text-gray-700'>{field.label || fieldKey}</label>
        {!readOnly && (
          <Button type='button' variant='ghost' size='sm' onClick={handleAdd} className='gap-1 text-primary'>
            <Plus className='w-4 h-4' />
            Agregar
          </Button>
        )}
      </div>

      {items.length === 0 && (
        <p className='text-xs text-gray-400 italic'>Sin elementos. Haz clic en "Agregar" para crear uno.</p>
      )}

      <div className='space-y-3'>
        {items.map((item, index) => (
          <div key={index} className='relative border border-[#E4E8EF] rounded-xl p-4 space-y-3 bg-white'>
            <div className='flex items-center justify-between mb-1'>
              <span className='text-xs font-medium text-gray-400'>
                {field.label || fieldKey} #{index + 1}
              </span>
              {!readOnly && (
                <button
                  type='button'
                  onClick={() => handleRemove(index)}
                  className='text-gray-400 hover:text-red-500 transition-colors cursor-pointer'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              )}
            </div>
            {Object.entries(itemSchema).map(([itemKey, itemField]) => (
              <StringField
                key={itemKey}
                label={(itemField as SchemaField).label || itemKey}
                value={String(item[itemKey] || '')}
                onChange={(v) => handleItemChange(index, itemKey, v)}
                readOnly={readOnly}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
