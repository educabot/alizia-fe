import { useMemo, useState } from 'react';
import { Network, Plus, Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { topicsApi } from '@/services/api';
import { useTopicsQuery, referenceKeys } from '@/hooks/queries/useReferenceQueries';
import { useConfigStore } from '@/store/configStore';
import { useQueryClient } from '@tanstack/react-query';
import { showApiError, toastSuccess } from '@/lib/toast';
import { DataState } from '@/components/DataState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Topic } from '@/types';

interface TopicFormState {
  name: string;
  description: string;
  parent_id: number | null;
}

const EMPTY_FORM: TopicFormState = { name: '', description: '', parent_id: null };

function flattenTopics(topics: Topic[]): Topic[] {
  const out: Topic[] = [];
  const walk = (list: Topic[]) => {
    for (const t of list) {
      out.push(t);
      if (t.children?.length) walk(t.children);
    }
  };
  walk(topics);
  return out;
}

export function AdminTopics() {
  const queryClient = useQueryClient();
  const orgConfig = useConfigStore((s) => s.orgConfig);
  const maxLevels = orgConfig?.topic_max_levels ?? 3;
  const levelNames = orgConfig?.topic_level_names ?? [];

  const { data: topics = [], isLoading, error, refetch } = useTopicsQuery();
  const flatTopics = useMemo(() => flattenTopics(topics), [topics]);

  const [dialogMode, setDialogMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [form, setForm] = useState<TopicFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreate = (parent?: Topic) => {
    setEditingTopic(null);
    setForm({ ...EMPTY_FORM, parent_id: parent?.id ?? null });
    setDialogMode('create');
  };

  const openEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setForm({
      name: topic.name,
      description: topic.description ?? '',
      parent_id: topic.parent_id,
    });
    setDialogMode('edit');
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setDialogMode('closed');
    setEditingTopic(null);
    setForm(EMPTY_FORM);
  };

  const refreshAll = async () => {
    await Promise.all([refetch(), queryClient.invalidateQueries({ queryKey: referenceKeys.topics })]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    setIsSubmitting(true);
    try {
      if (dialogMode === 'edit' && editingTopic) {
        await topicsApi.update(editingTopic.id, {
          name,
          description: form.description.trim() || undefined,
          parent_id: form.parent_id,
        });
        toastSuccess('Tema actualizado');
      } else {
        await topicsApi.create({
          name,
          description: form.description.trim() || undefined,
          parent_id: form.parent_id,
        });
        toastSuccess('Tema creado');
      }
      await refreshAll();
      closeDialog();
    } catch (err) {
      showApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opciones de parent: solo topics cuyo nivel + 1 <= maxLevels, y que no sean descendientes del que estoy editando
  const parentOptions = useMemo(() => {
    const editingId = editingTopic?.id;
    const descendants = new Set<number>();
    if (editingId) {
      const collect = (list: Topic[]) => {
        for (const t of list) {
          if (t.id === editingId) {
            const walk = (children?: Topic[]) => {
              if (!children) return;
              for (const c of children) {
                descendants.add(c.id);
                walk(c.children);
              }
            };
            walk(t.children);
            return;
          }
          if (t.children) collect(t.children);
        }
      };
      collect(topics);
      descendants.add(editingId);
    }
    return flatTopics.filter((t) => t.level < maxLevels && !descendants.has(t.id));
  }, [flatTopics, topics, maxLevels, editingTopic]);

  return (
    <div className='max-w-4xl mx-auto px-6 py-8'>
      <div className='flex items-start justify-between mb-6'>
        <div>
          <h1 className='title-2-emphasized text-[#10182B]'>Temas</h1>
          <p className='body-2-regular text-muted-foreground mt-1'>
            Gestiona la jerarquia curricular. Max {maxLevels} nivel{maxLevels === 1 ? '' : 'es'}.
          </p>
        </div>
        <Button onClick={() => openCreate()} className='gap-2'>
          <Plus className='w-4 h-4' />
          Nuevo tema
        </Button>
      </div>

      <DataState
        loading={isLoading}
        error={error}
        data={topics}
        onRetry={refetch}
        emptyState={
          <div className='text-center py-16 activity-card-bg rounded-2xl'>
            <Network className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='headline-1-bold text-foreground mb-2'>Aun no hay temas</h3>
            <p className='body-2-regular text-muted-foreground mb-4'>Crea el primer tema raiz.</p>
            <Button onClick={() => openCreate()} className='gap-2'>
              <Plus className='w-4 h-4' />
              Nuevo tema
            </Button>
          </div>
        }
      >
        <ul className='space-y-1'>
          {topics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              maxLevels={maxLevels}
              levelNames={levelNames}
              onAddChild={(t) => openCreate(t)}
              onEdit={openEdit}
            />
          ))}
        </ul>
      </DataState>

      {/* Create/Edit */}
      <Dialog open={dialogMode !== 'closed'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Editar tema' : 'Nuevo tema'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit'
                ? 'Actualiza los datos del tema. Si cambias el padre, se re-computan los niveles del subarbol.'
                : 'Crea un tema. Deja el padre vacio para crear un tema raiz.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='topic-parent'>Tema padre</Label>
              <select
                id='topic-parent'
                value={form.parent_id === null ? '' : String(form.parent_id)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, parent_id: e.target.value === '' ? null : Number(e.target.value) }))
                }
                className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <option value=''>— (raiz, nivel 1)</option>
                {parentOptions.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {'—'.repeat(t.level)} {t.name} (nivel {t.level})
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='topic-name'>Nombre</Label>
              <Input
                id='topic-name'
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='Ej: Algebra'
                required
                autoFocus
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='topic-description'>Descripcion (opcional)</Label>
              <Textarea
                id='topic-description'
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={closeDialog} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isSubmitting || !form.name.trim()}>
                {isSubmitting ? 'Guardando...' : dialogMode === 'edit' ? 'Guardar cambios' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function TopicRow({
  topic,
  maxLevels,
  levelNames,
  onAddChild,
  onEdit,
  depth = 0,
}: {
  topic: Topic;
  maxLevels: number;
  levelNames: string[];
  onAddChild: (parent: Topic) => void;
  onEdit: (topic: Topic) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = (topic.children?.length ?? 0) > 0;
  const canAddChild = topic.level < maxLevels;
  const levelLabel = levelNames[topic.level - 1] ?? `Nivel ${topic.level}`;

  return (
    <li>
      <div
        className='activity-card-bg rounded-lg p-3 flex items-center gap-2'
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <button
          type='button'
          onClick={() => setExpanded((v) => !v)}
          className={`w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-[#10182B] ${
            hasChildren ? '' : 'invisible'
          }`}
          aria-label={expanded ? 'Colapsar' : 'Expandir'}
        >
          {expanded ? <ChevronDown className='w-4 h-4' /> : <ChevronRight className='w-4 h-4' />}
        </button>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='body-2-regular text-[#10182B] font-medium truncate'>{topic.name}</span>
            <span className='text-xs text-muted-foreground bg-primary/5 px-2 py-0.5 rounded'>{levelLabel}</span>
          </div>
          {topic.description && <p className='text-xs text-muted-foreground mt-0.5 line-clamp-1'>{topic.description}</p>}
        </div>
        <div className='flex items-center gap-1 shrink-0'>
          {canAddChild && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onAddChild(topic)}
              aria-label={`Agregar subtema de ${topic.name}`}
              className='gap-1'
            >
              <Plus className='w-3.5 h-3.5' />
              Subtema
            </Button>
          )}
          <Button variant='outline' size='sm' onClick={() => onEdit(topic)} aria-label={`Editar ${topic.name}`}>
            <Pencil className='w-3.5 h-3.5' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            disabled
            title='El backend aun no soporta eliminar temas'
            aria-label={`Eliminar ${topic.name} (no disponible)`}
            className='text-red-600'
          >
            <Trash2 className='w-3.5 h-3.5' />
          </Button>
        </div>
      </div>
      {expanded && hasChildren && (
        <ul className='mt-1 space-y-1'>
          {topic.children!.map((child) => (
            <TopicRow
              key={child.id}
              topic={child}
              maxLevels={maxLevels}
              levelNames={levelNames}
              onAddChild={onAddChild}
              onEdit={onEdit}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
