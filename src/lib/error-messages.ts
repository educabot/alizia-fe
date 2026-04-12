/**
 * Catalogo de mensajes amigables por codigo de error de la API.
 * Fuente: docs/rfc-alizia/tecnico/errores.md (RFC §2.3).
 *
 * El backend devuelve siempre `{ error: { code, message, details } }`.
 * Siempre chequeamos `error.code`, nunca el HTTP status ni el mensaje crudo —
 * el `message` del backend esta en espanol pero a veces incluye detalles
 * tecnicos (ej. "Momento 'desarrollo' tiene 4 actividades, maximo permitido: 3").
 *
 * Este map sirve de "traduccion" a mensajes de UI sin divulgar internals.
 * Si un codigo no esta en el map, se usa el `message` del backend como fallback,
 * y si no hay mensaje, `DEFAULT_ERROR_MESSAGE`.
 */

export const DEFAULT_ERROR_MESSAGE = 'Ocurrio un error inesperado. Intenta nuevamente.';

export const ERROR_MESSAGES: Record<string, string> = {
  // ---------------------------------------------------------------------------
  // Errores comunes (team-ai-toolkit/errors)
  // ---------------------------------------------------------------------------
  VALIDATION_ERROR: 'Hay campos invalidos en el formulario. Revisa los datos e intenta nuevamente.',
  UNAUTHORIZED: 'Tu sesion expiro. Iniciar sesion nuevamente.',
  FORBIDDEN: 'No tenes permisos para realizar esta accion.',
  NOT_FOUND: 'No encontramos lo que buscas.',
  DUPLICATE: 'Ya existe un registro con esos datos.',
  CONFLICT: 'Hubo un conflicto al guardar los cambios. Recarga la pagina e intenta nuevamente.',
  INTERNAL_ERROR: 'Error interno del servidor. Intenta nuevamente en unos minutos.',
  NETWORK_ERROR: 'No pudimos conectarnos al servidor. Verifica tu conexion a internet.',

  // ---------------------------------------------------------------------------
  // Admin — Areas / Subjects / Courses (Fase 2)
  // ---------------------------------------------------------------------------
  DUPLICATE_AREA: 'Ya existe un area con ese nombre.',
  FORBIDDEN_AREA_NOT_IN_ORG: 'Este area no pertenece a tu organizacion.',
  USER_NOT_COORDINATOR: 'El usuario seleccionado no tiene rol de coordinador.',
  DUPLICATE_COORDINATOR: 'Ese usuario ya es coordinador de esta area.',
  DUPLICATE_SUBJECT: 'Ya existe una disciplina con ese nombre en el area.',
  DUPLICATE_COURSE: 'Ya existe un curso con ese nombre.',
  DUPLICATE_COURSE_SUBJECT: 'Ya existe esa combinacion de curso y disciplina para el ano lectivo.',

  // ---------------------------------------------------------------------------
  // Topics
  // ---------------------------------------------------------------------------
  TOPIC_EXCEEDS_MAX_LEVELS: 'El tema supera la profundidad maxima configurada para tu organizacion.',
  TOPIC_WRONG_LEVEL: 'Solo se pueden seleccionar temas del nivel configurado por la organizacion.',
  TOPIC_NOT_IN_ORG: 'Ese tema no pertenece a tu organizacion.',

  // ---------------------------------------------------------------------------
  // Time Slots
  // ---------------------------------------------------------------------------
  SHARED_CLASSES_DISABLED: 'Tu organizacion no permite clases compartidas entre disciplinas.',
  COURSE_SUBJECT_WRONG_COURSE: 'La disciplina seleccionada no pertenece a este curso.',
  TIME_SLOT_OVERLAP: 'Ya hay una clase en ese horario para este curso.',

  // ---------------------------------------------------------------------------
  // Activities
  // ---------------------------------------------------------------------------
  INVALID_MOMENT: 'El momento debe ser apertura, desarrollo o cierre.',

  // ---------------------------------------------------------------------------
  // Coordination Documents (Fase 3)
  // ---------------------------------------------------------------------------
  SUBJECT_NOT_IN_AREA: 'Alguna disciplina seleccionada no pertenece al area del documento.',
  TOPICS_NOT_FULLY_DISTRIBUTED: 'Hay temas sin asignar a ninguna disciplina.',
  DOCUMENT_NOT_DRAFT: 'Solo se pueden editar documentos en estado borrador.',
  INVALID_SECTION_KEY: 'La seccion que intentas editar no existe en la configuracion.',
  DOCUMENT_NO_TOPICS: 'El documento no tiene temas asignados. Agregalos antes de generar.',
  DOCUMENT_MISSING_REQUIRED_SECTIONS: 'Faltan secciones obligatorias por completar antes de publicar.',
  DOCUMENT_NO_CLASS_PLANS: 'Falta generar el plan de clases para alguna disciplina.',
  TOPICS_NOT_FULLY_COVERED: 'Hay temas sin asignar a ninguna clase en el plan.',
  INVALID_STATUS_TRANSITION: 'No se puede cambiar al estado solicitado.',
  INVALID_TOOL_CALL: 'Alizia no pudo interpretar tu solicitud. Reformula el pedido.',

  // ---------------------------------------------------------------------------
  // Teaching — Lesson Plans (Fase 5)
  // ---------------------------------------------------------------------------
  NO_PUBLISHED_DOCUMENT: 'No hay un documento de coordinacion publicado para esta disciplina.',
  LESSON_PLAN_ALREADY_EXISTS: 'Ya existe un plan para esa clase.',
  INVALID_MOMENT_ACTIVITIES: 'La cantidad de actividades en algun momento no es valida.',
  TOPIC_NOT_IN_DOCUMENT: 'El tema seleccionado no esta asignado a la disciplina en el documento de coordinacion.',
  ACTIVITY_NOT_IN_MOMENT: 'La actividad no corresponde al momento seleccionado.',
  LESSON_PLAN_INCOMPLETE: 'Faltan completar momentos antes de publicar el plan.',

  // ---------------------------------------------------------------------------
  // Resources (Fase 6)
  // ---------------------------------------------------------------------------
  RESOURCE_TYPE_REQUIRES_FONT: 'Este tipo de recurso requiere una fuente bibliografica.',
  RESOURCE_TYPE_DISABLED: 'Este tipo de recurso no esta disponible para tu organizacion.',
  RESOURCE_NOT_DRAFT: 'Solo se pueden regenerar recursos en estado borrador.',
  RESOURCE_NO_FONT: 'El recurso requiere una fuente antes de poder generar contenido.',
  CONTENT_SCHEMA_MISMATCH: 'El contenido enviado no cumple con el formato esperado.',

  // ---------------------------------------------------------------------------
  // AI (Fase 4)
  // ---------------------------------------------------------------------------
  AI_GENERATION_ERROR: 'No pudimos generar el contenido con IA. Intenta nuevamente.',
  AI_GENERATION_TIMEOUT: 'La generacion con IA tardo demasiado. Intenta nuevamente en unos segundos.',
  AI_RATE_LIMITED: 'Hay mucho trafico en este momento. Espera unos segundos e intenta de nuevo.',

  // ---------------------------------------------------------------------------
  // Fallback genericos
  // ---------------------------------------------------------------------------
  UNKNOWN_ERROR: DEFAULT_ERROR_MESSAGE,
};

/**
 * Devuelve un mensaje amigable para un codigo de error.
 * Si el codigo no esta mapeado, devuelve el fallback (o DEFAULT_ERROR_MESSAGE).
 */
export function getErrorMessage(code: string | undefined, fallback?: string): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  return fallback ?? DEFAULT_ERROR_MESSAGE;
}
