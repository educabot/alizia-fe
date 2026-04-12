import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SharedClassIndicator } from './SharedClassIndicator';
import type { DocumentSubject, DocumentClass } from '@/types';

interface ClassPlanTableProps {
  subjects: DocumentSubject[];
  onEditClass?: (subjectId: number, classNumber: number, field: 'title' | 'objective', value: string) => void;
  readOnly?: boolean;
}

interface ClassRowProps {
  cls: DocumentClass;
  subjectId: number;
  onEdit?: (field: 'title' | 'objective', value: string) => void;
  readOnly: boolean;
}

function ClassRow({ cls, onEdit, readOnly }: ClassRowProps) {
  const [editingField, setEditingField] = useState<'title' | 'objective' | null>(null);
  const [draft, setDraft] = useState('');

  const startEdit = (field: 'title' | 'objective') => {
    if (readOnly) return;
    setDraft(field === 'title' ? cls.title : cls.objective);
    setEditingField(field);
  };

  const save = () => {
    if (editingField && onEdit) {
      onEdit(editingField, draft);
    }
    setEditingField(null);
  };

  const cancel = () => setEditingField(null);

  return (
    <div className='bg-white/50 rounded-xl p-4 space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-semibold text-gray-500'>Clase {cls.class_number}</span>
          {cls.is_shared && <SharedClassIndicator />}
        </div>
        {!readOnly && (
          <button
            type='button'
            onClick={() => startEdit('title')}
            className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
          >
            <Pencil className='w-3.5 h-3.5' />
          </button>
        )}
      </div>

      {/* Title */}
      {editingField === 'title' ? (
        <EditField value={draft} onChange={setDraft} onSave={save} onCancel={cancel} />
      ) : (
        <h4
          className={cn(
            'text-sm font-medium text-gray-900',
            !readOnly && 'cursor-pointer hover:bg-primary/5 rounded px-1 -mx-1 transition-colors',
          )}
          onClick={() => startEdit('title')}
        >
          {cls.title || 'Sin titulo'}
        </h4>
      )}

      {/* Objective */}
      {editingField === 'objective' ? (
        <EditField value={draft} onChange={setDraft} onSave={save} onCancel={cancel} />
      ) : (
        <p
          className={cn(
            'text-xs text-gray-600',
            !readOnly && 'cursor-pointer hover:bg-primary/5 rounded px-1 -mx-1 transition-colors',
          )}
          onClick={() => startEdit('objective')}
        >
          {cls.objective || 'Sin objetivo'}
        </p>
      )}

      {/* Topics */}
      {cls.topics.length > 0 && (
        <div className='flex flex-wrap gap-1 pt-1'>
          {cls.topics.map((t) => (
            <span key={t.id} className='text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full'>
              {t.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EditField({
  value,
  onChange,
  onSave,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className='space-y-1'>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full text-sm border-b-2 border-primary bg-transparent focus:outline-none px-1'
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className='flex gap-1'>
        <button
          type='button'
          onClick={onSave}
          className='text-xs px-2 py-0.5 bg-primary text-white rounded hover:bg-primary/90'
        >
          Guardar
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300'
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function SubjectSection({
  subject,
  onEditClass,
  readOnly,
}: {
  subject: DocumentSubject;
  onEditClass?: ClassPlanTableProps['onEditClass'];
  readOnly: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className='space-y-2'>
      <button type='button' onClick={() => setExpanded(!expanded)} className='flex items-center gap-2 w-full text-left'>
        {expanded ? (
          <ChevronDown className='w-4 h-4 text-gray-500' />
        ) : (
          <ChevronRight className='w-4 h-4 text-gray-500' />
        )}
        <span className='font-medium text-gray-900'>{subject.subject_name}</span>
        <span className='text-xs text-gray-500'>
          ({subject.classes.length} {subject.classes.length === 1 ? 'clase' : 'clases'})
        </span>
      </button>

      {expanded && (
        <div className='ml-6 space-y-2'>
          {subject.classes.length === 0 ? (
            <p className='text-sm text-gray-400 italic'>Sin clases planificadas</p>
          ) : (
            subject.classes.map((cls) => (
              <ClassRow
                key={cls.id}
                cls={cls}
                subjectId={subject.subject_id}
                onEdit={
                  onEditClass
                    ? (field, value) => onEditClass(subject.subject_id, cls.class_number, field, value)
                    : undefined
                }
                readOnly={readOnly}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function ClassPlanTable({ subjects, onEditClass, readOnly = false }: ClassPlanTableProps) {
  if (subjects.length === 0) {
    return <div className='text-sm text-gray-500 py-4 text-center'>No hay disciplinas asignadas</div>;
  }

  return (
    <div className='space-y-4'>
      <h3 className='font-semibold text-gray-900'>Clases por disciplina</h3>
      {subjects.map((subject) => (
        <SubjectSection key={subject.subject_id} subject={subject} onEditClass={onEditClass} readOnly={readOnly} />
      ))}
    </div>
  );
}
