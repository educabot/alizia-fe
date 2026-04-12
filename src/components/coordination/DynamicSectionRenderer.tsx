import { SectionEditor } from './SectionEditor';
import type { SectionConfig, SectionValue } from '@/types';

interface DynamicSectionRendererProps {
  /** Section configs from org_config.coord_doc_sections */
  sectionConfigs: SectionConfig[];
  /** Current section values from the document */
  sections: Record<string, SectionValue>;
  /** Called when any section value changes */
  onSectionChange: (key: string, value: SectionValue) => void;
  /** Called to generate a specific section with AI */
  onGenerateSection?: (sectionKey: string) => Promise<void>;
  /** Set of section keys currently being generated */
  generatingSections?: Set<string>;
  /** Make all sections read-only */
  readOnly?: boolean;
}

/**
 * Renders all sections of a coordination document dynamically
 * based on the org's coord_doc_sections config.
 */
export function DynamicSectionRenderer({
  sectionConfigs,
  sections,
  onSectionChange,
  onGenerateSection,
  generatingSections = new Set(),
  readOnly = false,
}: DynamicSectionRendererProps) {
  if (sectionConfigs.length === 0) {
    return (
      <div className='text-sm text-gray-500 py-4 text-center'>No hay secciones configuradas para este documento</div>
    );
  }

  return (
    <div className='space-y-6'>
      {sectionConfigs.map((config, index) => (
        <div key={config.key}>
          {index > 0 && <div className='border-t border-purple-200/50 mb-6' />}
          <SectionEditor
            config={config}
            value={sections[config.key] ?? {}}
            onChange={(value) => onSectionChange(config.key, value)}
            onGenerateSection={onGenerateSection}
            isGenerating={generatingSections.has(config.key)}
            readOnly={readOnly}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Validates that all required sections have values.
 * Returns list of missing section labels.
 */
export function validateSections(sectionConfigs: SectionConfig[], sections: Record<string, SectionValue>): string[] {
  const missing: string[] = [];
  for (const config of sectionConfigs) {
    if (!config.required) continue;
    const value = sections[config.key];
    const hasValue = value?.value?.trim() || value?.selected_option?.trim();
    if (!hasValue) {
      missing.push(config.label);
    }
  }
  return missing;
}
