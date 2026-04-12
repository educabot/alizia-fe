import type {
  OrgConfig,
  Topic,
  Area,
  Subject,
  Course,
  Activity,
  Font,
  CourseSubject,
  ResourceType,
  Resource,
  Notification,
  PlanningProgress,
  ProfileField,
  TourStep,
} from '@/types';

/** Default org config for local development without backend */
export const MOCK_ORG_CONFIG: OrgConfig = {
  topic_max_levels: 3,
  topic_level_names: ['Nucleo problematico', 'Area de conocimiento', 'Categoria'],
  topic_selection_level: 3,
  shared_classes_enabled: true,
  desarrollo_max_activities: 3,
  coord_doc_sections: [
    { key: 'problem_edge', label: 'Arista del problema', type: 'text', ai_prompt: '', required: true },
    { key: 'theoretical_framework', label: 'Marco teorico', type: 'text', ai_prompt: '', required: true },
    {
      key: 'methodological_approach',
      label: 'Enfoque metodologico',
      type: 'select_text',
      options: ['Constructivista', 'Conductista', 'Conectivista', 'Mixto'],
      ai_prompt: '',
      required: true,
    },
    { key: 'evaluation_criteria', label: 'Criterios de evaluacion', type: 'text', ai_prompt: '', required: false },
  ],
  modules: {
    contenido: true,
    planificacion: true,
  },
  visual_identity: {
    platform_name: 'Alizia',
    logo_url: null,
    primary_color: '#735fe3',
  },
  ai_settings: {
    tone: 'profesional y pedagogico',
    max_generation_length: 2000,
    max_chat_interactions: 20,
  },
  onboarding: {
    allow_skip: true,
    profile_fields: [
      {
        key: 'specialty',
        label: 'Area de especialidad',
        type: 'select',
        options: ['Ciencias Naturales', 'Ciencias Sociales', 'Matematica', 'Lengua', 'Arte'],
        required: true,
      },
      { key: 'experience', label: 'Anos de experiencia docente', type: 'text', required: false },
    ],
    tour_steps: [
      {
        target: '.sidebar-nav',
        title: 'Navegacion',
        description: 'Desde aqui accedes a todas las secciones de la plataforma.',
      },
      {
        target: '.dashboard-section',
        title: 'Dashboard',
        description: 'Tu panel principal con el resumen de tu trabajo.',
      },
      {
        target: '.sidebar-resources',
        title: 'Recursos',
        description: 'Crea y gestiona materiales educativos para tus clases.',
      },
    ],
  },
};

/** Mock topic tree (3 levels) */
export const MOCK_TOPICS: Topic[] = [
  {
    id: 1,
    name: 'Ciencias Naturales y Tecnologia',
    level: 1,
    parent_id: null,
    children: [
      {
        id: 10,
        name: 'Seres vivos y ambiente',
        level: 2,
        parent_id: 1,
        children: [
          { id: 100, name: 'Ecosistemas', level: 3, parent_id: 10, children: [] },
          { id: 101, name: 'Biodiversidad', level: 3, parent_id: 10, children: [] },
          { id: 102, name: 'Cadenas troficas', level: 3, parent_id: 10, children: [] },
        ],
      },
      {
        id: 11,
        name: 'Materia y energia',
        level: 2,
        parent_id: 1,
        children: [
          { id: 110, name: 'Estados de la materia', level: 3, parent_id: 11, children: [] },
          { id: 111, name: 'Transformaciones energeticas', level: 3, parent_id: 11, children: [] },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Ciencias Sociales y Humanidades',
    level: 1,
    parent_id: null,
    children: [
      {
        id: 20,
        name: 'Sociedad y cultura',
        level: 2,
        parent_id: 2,
        children: [
          { id: 200, name: 'Identidad cultural', level: 3, parent_id: 20, children: [] },
          { id: 201, name: 'Migraciones', level: 3, parent_id: 20, children: [] },
        ],
      },
      {
        id: 21,
        name: 'Espacio y territorio',
        level: 2,
        parent_id: 2,
        children: [
          { id: 210, name: 'Geografia regional', level: 3, parent_id: 21, children: [] },
          { id: 211, name: 'Recursos naturales', level: 3, parent_id: 21, children: [] },
        ],
      },
    ],
  },
];

export const MOCK_AREAS: Area[] = [
  { id: 1, name: 'Ciencias Naturales', created_at: '2026-01-01' },
  { id: 2, name: 'Ciencias Sociales', created_at: '2026-01-01' },
  { id: 3, name: 'Matematica', created_at: '2026-01-01' },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 1, name: 'Biologia', area_id: 1, area_name: 'Ciencias Naturales', created_at: '2026-01-01' },
  { id: 2, name: 'Fisica', area_id: 1, area_name: 'Ciencias Naturales', created_at: '2026-01-01' },
  { id: 3, name: 'Historia', area_id: 2, area_name: 'Ciencias Sociales', created_at: '2026-01-01' },
  { id: 4, name: 'Geografia', area_id: 2, area_name: 'Ciencias Sociales', created_at: '2026-01-01' },
  { id: 5, name: 'Algebra', area_id: 3, area_name: 'Matematica', created_at: '2026-01-01' },
];

export const MOCK_COURSES: Course[] = [
  { id: 1, name: '1ro A', school_year: 2026, created_at: '2026-01-01' },
  { id: 2, name: '2do A', school_year: 2026, created_at: '2026-01-01' },
  { id: 3, name: '3ro B', school_year: 2026, created_at: '2026-01-01' },
];

export const MOCK_COURSE_SUBJECTS: CourseSubject[] = [
  {
    id: 1,
    course_id: 1,
    course_name: '1ro A',
    subject_id: 1,
    subject_name: 'Biologia',
    teacher_id: 2,
    teacher_name: 'Prof. Garcia',
    school_year: 2026,
  },
  {
    id: 2,
    course_id: 1,
    course_name: '1ro A',
    subject_id: 2,
    subject_name: 'Fisica',
    teacher_id: 2,
    teacher_name: 'Prof. Garcia',
    school_year: 2026,
  },
  {
    id: 3,
    course_id: 1,
    course_name: '1ro A',
    subject_id: 3,
    subject_name: 'Historia',
    teacher_id: null,
    teacher_name: null,
    school_year: 2026,
  },
];

export const MOCK_ACTIVITIES: Record<string, Activity[]> = {
  apertura: [
    { id: 1, name: 'Lluvia de ideas', moment: 'apertura' },
    { id: 2, name: 'Pregunta disparadora', moment: 'apertura' },
    { id: 3, name: 'Video introductorio', moment: 'apertura' },
  ],
  desarrollo: [
    { id: 10, name: 'Trabajo en grupo', moment: 'desarrollo' },
    { id: 11, name: 'Lectura comprensiva', moment: 'desarrollo' },
    { id: 12, name: 'Resolucion de problemas', moment: 'desarrollo' },
    { id: 13, name: 'Debate guiado', moment: 'desarrollo' },
  ],
  cierre: [
    { id: 20, name: 'Puesta en comun', moment: 'cierre' },
    { id: 21, name: 'Evaluacion formativa', moment: 'cierre' },
    { id: 22, name: 'Reflexion escrita', moment: 'cierre' },
  ],
};

export const MOCK_FONTS: Font[] = [
  { id: 1, name: 'Curtis, H. (2008). Biologia', area_id: 1, created_at: '2026-01-01' },
  { id: 2, name: 'Alonso, M. (2000). Fisica', area_id: 1, created_at: '2026-01-01' },
  { id: 3, name: 'Hobsbawm, E. (1994). Historia del siglo XX', area_id: 2, created_at: '2026-01-01' },
];

export const MOCK_RESOURCE_TYPES: ResourceType[] = [
  {
    id: 1,
    key: 'lecture_guide',
    name: 'Guia de lectura',
    description: 'Guia para acompanar la lectura de una fuente bibliografica',
    requires_font: true,
    prompt: '',
    output_schema: {
      title: { type: 'string', label: 'Titulo' },
      introduction: { type: 'string', label: 'Introduccion' },
      sections: {
        type: 'array',
        label: 'Secciones',
        items: {
          heading: { type: 'string', label: 'Subtitulo' },
          content: { type: 'string', label: 'Contenido' },
        },
      },
      conclusion: { type: 'string', label: 'Conclusion' },
    },
    is_custom: false,
  },
  {
    id: 2,
    key: 'course_sheet',
    name: 'Ficha de catedra',
    description: 'Material de estudio sintetico sobre un tema',
    requires_font: false,
    prompt: '',
    output_schema: {
      title: { type: 'string', label: 'Titulo' },
      objective: { type: 'string', label: 'Objetivo' },
      content: { type: 'string', label: 'Desarrollo' },
      key_concepts: {
        type: 'array',
        label: 'Conceptos clave',
        items: {
          term: { type: 'string', label: 'Termino' },
          definition: { type: 'string', label: 'Definicion' },
        },
      },
      bibliography: { type: 'string', label: 'Bibliografia' },
    },
    is_custom: false,
  },
  {
    id: 3,
    key: 'exam',
    name: 'Evaluacion',
    description: 'Evaluacion con preguntas y criterios de correccion',
    requires_font: false,
    prompt: '',
    output_schema: {
      title: { type: 'string', label: 'Titulo' },
      instructions: { type: 'string', label: 'Consignas generales' },
      questions: {
        type: 'array',
        label: 'Preguntas',
        items: {
          question: { type: 'string', label: 'Pregunta' },
          answer_guide: { type: 'string', label: 'Guia de respuesta' },
        },
      },
    },
    is_custom: false,
  },
];

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 1,
    resource_type_id: 1,
    resource_type_name: 'Guia de lectura',
    title: 'Guia de lectura - Ecosistemas',
    content: {
      title: 'Guia de lectura: Ecosistemas y biodiversidad',
      introduction: 'Esta guia acompana la lectura del capitulo 5 del libro de Curtis sobre ecosistemas.',
      sections: [
        {
          heading: 'Concepto de ecosistema',
          content:
            'Un ecosistema es un sistema biologico constituido por una comunidad de organismos vivos y el medio fisico donde se relacionan.',
        },
        {
          heading: 'Flujo de energia',
          content:
            'La energia fluye a traves de los ecosistemas en una sola direccion, desde los productores hacia los consumidores.',
        },
      ],
      conclusion:
        'Los ecosistemas son sistemas complejos que requieren un equilibrio entre sus componentes bioticos y abioticos.',
    },
    user_id: 2,
    font_id: 1,
    course_subject_id: 1,
    status: 'active',
    created_at: '2026-03-01',
    updated_at: '2026-03-15',
  },
  {
    id: 2,
    resource_type_id: 2,
    resource_type_name: 'Ficha de catedra',
    title: 'Ficha - Estados de la materia',
    content: {
      title: 'Estados de la materia',
      objective: 'Comprender las propiedades y transformaciones de los estados de la materia.',
      content:
        'La materia se presenta en tres estados fundamentales: solido, liquido y gaseoso. Cada uno tiene propiedades distintivas.',
      key_concepts: [
        { term: 'Fusion', definition: 'Cambio de estado de solido a liquido por absorcion de calor.' },
        { term: 'Evaporacion', definition: 'Cambio de estado de liquido a gaseoso.' },
      ],
      bibliography: 'Alonso, M. (2000). Fisica. Addison-Wesley.',
    },
    user_id: 2,
    course_subject_id: 2,
    status: 'active',
    created_at: '2026-03-05',
    updated_at: '2026-03-10',
  },
  {
    id: 3,
    resource_type_id: 3,
    resource_type_name: 'Evaluacion',
    title: 'Evaluacion - Biodiversidad',
    content: {},
    user_id: 2,
    course_subject_id: 1,
    status: 'draft',
    created_at: '2026-04-01',
    updated_at: '2026-04-01',
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    user_id: 2,
    type: 'publication',
    title: 'Documento publicado',
    message: 'El coordinador publico el documento de coordinacion para "Biologia - 1ro A".',
    read: false,
    created_at: '2026-04-08T10:00:00Z',
  },
  {
    id: 2,
    user_id: 2,
    type: 'deadline',
    title: 'Plazo proximo',
    message: 'Completa tus planes de clase para Biologia antes del 15 de abril.',
    read: false,
    created_at: '2026-04-07T14:30:00Z',
  },
  {
    id: 3,
    user_id: 2,
    type: 'update',
    title: 'Plan actualizado',
    message: 'Se actualizo el plan de la clase 3 de Fisica.',
    read: true,
    created_at: '2026-04-05T09:00:00Z',
  },
];

export const MOCK_PLANNING_PROGRESS: PlanningProgress[] = [
  { course_subject_id: 1, course_subject_name: 'Biologia - 1ro A', completed: 5, total: 10 },
  { course_subject_id: 2, course_subject_name: 'Fisica - 1ro A', completed: 8, total: 10 },
  { course_subject_id: 3, course_subject_name: 'Historia - 1ro A', completed: 2, total: 10 },
];
