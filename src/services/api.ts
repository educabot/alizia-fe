import { apiClient, fetchPaginated } from './api-client';
import type {
  Activity,
  Area,
  ChatRequest,
  ChatResponse,
  CoordinationDocument,
  CoordinationDocumentCreate,
  CoordinationDocumentUpdate,
  Course,
  CourseSubject,
  Font,
  GenerateActivityRequest,
  GenerateRequest,
  LessonPlan,
  LessonPlanCreate,
  LoginRequest,
  LoginResponse,
  MomentKey,
  Notification,
  OnboardingStatus,
  PaginatedResponse,
  PlanningProgress,
  Resource,
  ResourceCreate,
  ResourceType,
  Subject,
  TimeSlot,
  Topic,
  User,
} from '@/types';

// =============================================================================
// Auth
// =============================================================================

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<LoginResponse>('/auth/login', data),
};

// =============================================================================
// Areas
// =============================================================================

export const areasApi = {
  list: (params?: { limit?: number; offset?: number }) => fetchPaginated<Area>('/areas', params?.limit, params?.offset),
  getById: (id: number) => apiClient.get<Area>(`/areas/${id}`),
  create: (data: { name: string; description?: string }) => apiClient.post<Area>('/areas', data),
  update: (id: number, data: { name?: string; description?: string }) => apiClient.put<Area>(`/areas/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/areas/${id}`),
  addCoordinator: (areaId: number, userId: number) =>
    apiClient.post<void>(`/areas/${areaId}/coordinators`, { user_id: userId }),
  removeCoordinator: (areaId: number, userId: number) =>
    apiClient.delete<void>(`/areas/${areaId}/coordinators/${userId}`),
};

// =============================================================================
// Subjects
// =============================================================================

export const subjectsApi = {
  list: (params?: { limit?: number; offset?: number; area_id?: number }) => {
    const query = params?.area_id ? `/subjects?area_id=${params.area_id}` : '/subjects';
    return fetchPaginated<Subject>(query, params?.limit, params?.offset);
  },
  create: (data: { name: string; area_id: number }) => apiClient.post<Subject>('/subjects', data),
};

// =============================================================================
// Courses
// =============================================================================

export const coursesApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    fetchPaginated<Course>('/courses', params?.limit, params?.offset),
  getById: (id: number) => apiClient.get<Course>(`/courses/${id}`),
  create: (data: { name: string; school_year: number }) => apiClient.post<Course>('/courses', data),
  getTimeSlots: (courseId: number) => apiClient.get<PaginatedResponse<TimeSlot>>(`/courses/${courseId}/time-slots`),
  createTimeSlot: (
    courseId: number,
    data: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      course_subject_ids: number[];
    },
  ) => apiClient.post<TimeSlot>(`/courses/${courseId}/time-slots`, data),
};

// =============================================================================
// Course Subjects
// =============================================================================

export const courseSubjectsApi = {
  list: (params?: { limit?: number; offset?: number; course_id?: number; teacher_id?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.course_id) searchParams.set('course_id', String(params.course_id));
    if (params?.teacher_id) searchParams.set('teacher_id', String(params.teacher_id));
    const query = searchParams.toString() ? `/course-subjects?${searchParams}` : '/course-subjects';
    return fetchPaginated<CourseSubject>(query, params?.limit, params?.offset);
  },
  getById: (id: number) => apiClient.get<CourseSubject>(`/course-subjects/${id}`),
  create: (data: {
    course_id: number;
    subject_id: number;
    teacher_id: number;
    start_date: string;
    end_date: string;
    school_year: number;
  }) => apiClient.post<CourseSubject>('/course-subjects', data),
};

// =============================================================================
// Topics
// =============================================================================

export const topicsApi = {
  getTree: (params?: { level?: number; parent_id?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.level) searchParams.set('level', String(params.level));
    if (params?.parent_id) searchParams.set('parent_id', String(params.parent_id));
    const query = searchParams.toString() ? `/topics?${searchParams}` : '/topics';
    return apiClient.get<{ items: Topic[] }>(query);
  },
  create: (data: { name: string; description?: string; parent_id: number | null }) =>
    apiClient.post<Topic>('/topics', data),
};

// =============================================================================
// Activities
// =============================================================================

export const activitiesApi = {
  list: (params?: { moment?: MomentKey }) => {
    const query = params?.moment ? `/activities?moment=${params.moment}` : '/activities';
    return apiClient.get<PaginatedResponse<Activity>>(query);
  },
  create: (data: { moment: MomentKey; name: string; description?: string; duration_minutes?: number }) =>
    apiClient.post<Activity>('/activities', data),
};

// =============================================================================
// Coordination Documents
// =============================================================================

export const coordinationDocumentsApi = {
  list: (params?: { limit?: number; offset?: number; area_id?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.area_id) searchParams.set('area_id', String(params.area_id));
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString() ? `/coordination-documents?${searchParams}` : '/coordination-documents';
    return fetchPaginated<CoordinationDocument>(query, params?.limit, params?.offset);
  },
  getById: (id: number) => apiClient.get<CoordinationDocument>(`/coordination-documents/${id}`),
  create: (data: CoordinationDocumentCreate) => apiClient.post<CoordinationDocument>('/coordination-documents', data),
  update: (id: number, data: CoordinationDocumentUpdate) =>
    apiClient.patch<CoordinationDocument>(`/coordination-documents/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/coordination-documents/${id}`),
  generate: (id: number, data?: GenerateRequest) =>
    apiClient.post<{
      sections_generated: string[];
      class_plans_generated: { subject_id: number; subject_name: string; classes_count: number }[];
    }>(`/coordination-documents/${id}/generate`, data ?? {}),
  chat: (id: number, data: ChatRequest) => apiClient.post<ChatResponse>(`/coordination-documents/${id}/chat`, data),
};

// =============================================================================
// Lesson Plans
// =============================================================================

export const lessonPlansApi = {
  listByCourseSubject: (courseSubjectId: number) =>
    apiClient.get<PaginatedResponse<LessonPlan>>(`/course-subjects/${courseSubjectId}/lesson-plans`),
  getById: (id: number) => apiClient.get<LessonPlan>(`/lesson-plans/${id}`),
  create: (data: LessonPlanCreate) => apiClient.post<LessonPlan>('/lesson-plans', data),
  update: (id: number, data: Partial<LessonPlanCreate>) => apiClient.patch<LessonPlan>(`/lesson-plans/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/lesson-plans/${id}`),
  generateActivity: (id: number, data: GenerateActivityRequest) =>
    apiClient.post<{ moment: MomentKey; activity_id: number; content: string }>(
      `/lesson-plans/${id}/generate-activity`,
      data,
    ),
  updateStatus: (id: number, status: string) => apiClient.patch<LessonPlan>(`/lesson-plans/${id}/status`, { status }),
};

// =============================================================================
// Fonts
// =============================================================================

export const fontsApi = {
  list: (params: { area_id: number; validated_only?: boolean }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('area_id', String(params.area_id));
    if (params.validated_only !== undefined) searchParams.set('validated_only', String(params.validated_only));
    return apiClient.get<PaginatedResponse<Font>>(`/fonts?${searchParams}`);
  },
  getById: (id: number) => apiClient.get<Font>(`/fonts/${id}`),
};

// =============================================================================
// Resource Types
// =============================================================================

export const resourceTypesApi = {
  list: () => apiClient.get<PaginatedResponse<ResourceType>>('/resource-types'),
};

// =============================================================================
// Resources
// =============================================================================

export const resourcesApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    fetchPaginated<Resource>('/resources', params?.limit, params?.offset),
  getById: (id: number) => apiClient.get<Resource>(`/resources/${id}`),
  create: (data: ResourceCreate) => apiClient.post<Resource>('/resources', data),
  update: (id: number, data: { title?: string; content?: Record<string, unknown>; status?: string }) =>
    apiClient.patch<Resource>(`/resources/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/resources/${id}`),
  generate: (id: number, data?: { custom_instruction?: string }) =>
    apiClient.post<{ content: Record<string, unknown> }>(`/resources/${id}/generate`, data ?? {}),
};

// =============================================================================
// Chat (general, sin contexto de documento)
// =============================================================================

export const chatApi = {
  send: (data: ChatRequest) => apiClient.post<ChatResponse>('/chat', data),
};

// =============================================================================
// Organization / Config
// =============================================================================

export const orgApi = {
  getConfig: () => apiClient.get<{ config: import('@/types').OrgConfig }>('/org/config'),
};

// =============================================================================
// Onboarding
// =============================================================================

export const onboardingApi = {
  getStatus: () => apiClient.get<OnboardingStatus>('/users/me/onboarding-status'),
  complete: (profileData?: Record<string, unknown>) =>
    apiClient.post<void>('/users/me/onboarding/complete', profileData ?? {}),
};

// =============================================================================
// Notifications
// =============================================================================

export const notificationsApi = {
  list: () => apiClient.get<PaginatedResponse<Notification>>('/users/me/notifications'),
  markAsRead: (id: number) => apiClient.patch<void>(`/users/me/notifications/${id}/read`, {}),
};

// =============================================================================
// Dashboard
// =============================================================================

export const dashboardApi = {
  getCoordinator: () => apiClient.get<{ planning_progress: PlanningProgress[] }>('/dashboard/coordinator'),
  getTeacher: () =>
    apiClient.get<{ pending_plans_count: number; upcoming_classes_count: number }>('/dashboard/teacher'),
};

// =============================================================================
// Users (admin)
// =============================================================================

export const usersApi = {
  list: (params?: { limit?: number; offset?: number; role?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    const query = searchParams.toString() ? `/users?${searchParams}` : '/users';
    return fetchPaginated<User>(query, params?.limit, params?.offset);
  },
};
