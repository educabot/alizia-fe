import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { validateSections } from './DynamicSectionRenderer';
import type { CoordinationDocument, DocumentSubject, SectionConfig, SectionValue } from '@/types';

export interface PublishValidationIssue {
  kind: 'missing_section' | 'subject_without_classes' | 'class_missing_content';
  message: string;
}

/**
 * Pure validation logic for whether a coordination document can be published.
 * Checks:
 *   1. All required sections have a value or selected_option
 *   2. Every subject has at least one class
 *   3. Every class has a title and objective
 */
export function validateDocumentForPublish(document: CoordinationDocument): PublishValidationIssue[] {
  const issues: PublishValidationIssue[] = [];

  const sectionConfigs: SectionConfig[] = document.org_config?.coord_doc_sections ?? [];
  const sections: Record<string, SectionValue> = document.sections ?? {};

  const missingLabels = validateSections(sectionConfigs, sections);
  for (const label of missingLabels) {
    issues.push({
      kind: 'missing_section',
      message: `Seccion requerida sin completar: ${label}`,
    });
  }

  const subjects: DocumentSubject[] = document.subjects ?? [];
  for (const subject of subjects) {
    if (!subject.classes || subject.classes.length === 0) {
      issues.push({
        kind: 'subject_without_classes',
        message: `La disciplina "${subject.subject_name}" no tiene clases planificadas`,
      });
      continue;
    }
    for (const cls of subject.classes) {
      if (!cls.title?.trim() || !cls.objective?.trim()) {
        issues.push({
          kind: 'class_missing_content',
          message: `Clase ${cls.class_number} de "${subject.subject_name}" sin titulo u objetivo`,
        });
      }
    }
  }

  return issues;
}

/** Convenience helper for boolean checks. */
export function canPublishDocument(document: CoordinationDocument): boolean {
  return validateDocumentForPublish(document).length === 0;
}

interface PublishValidationProps {
  document: CoordinationDocument;
}

/**
 * Visual feedback of publish-readiness.
 * Renders an alert banner listing every blocking issue, or a success hint.
 * RFC Epic 4 — Validacion al publicar.
 */
export function PublishValidation({ document }: PublishValidationProps) {
  const issues = validateDocumentForPublish(document);

  if (issues.length === 0) {
    return (
      <div
        role='status'
        className='flex items-start gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800'
      >
        <CheckCircle2 className='w-4 h-4 shrink-0 mt-0.5' />
        <span>El documento esta listo para publicar.</span>
      </div>
    );
  }

  return (
    <div role='alert' className='rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900'>
      <div className='flex items-center gap-2 mb-2 font-medium'>
        <AlertTriangle className='w-4 h-4' />
        <span>No se puede publicar todavia</span>
      </div>
      <ul className='list-disc list-inside space-y-0.5 text-amber-800'>
        {issues.map((issue, index) => (
          <li key={`${issue.kind}-${index}`}>{issue.message}</li>
        ))}
      </ul>
    </div>
  );
}
