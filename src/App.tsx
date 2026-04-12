import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { createQueryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/authStore';
import { useConfigStore } from '@/store/configStore';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import { resourceKeys } from '@/hooks/queries/useResourceQueries';
import { coordinationKeys } from '@/hooks/queries/useCoordinationQueries';

const queryClient = createQueryClient();
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RequireModule } from '@/components/auth/RequireModule';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteBoundary } from '@/components/RouteBoundary';
import { LoadingFallback } from '@/components/LoadingFallback';
import { MainLayout } from './components/layout/MainLayout';
import { applyVisualIdentity, clearVisualIdentity } from '@/lib/visual-identity';
import {
  areasApi,
  coursesApi,
  subjectsApi,
  coordinationDocumentsApi,
  courseSubjectsApi,
  activitiesApi,
  topicsApi,
  orgApi,
} from './services/api';
import {
  MOCK_ORG_CONFIG,
  MOCK_TOPICS,
  MOCK_AREAS,
  MOCK_SUBJECTS,
  MOCK_COURSES,
  MOCK_COURSE_SUBJECTS,
  MOCK_ACTIVITIES,
  MOCK_FONTS,
  MOCK_RESOURCE_TYPES,
  MOCK_RESOURCES,
} from '@/mocks/mock-config';

// Lazy-loaded pages — each becomes its own chunk
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const CoordinatorHome = lazy(() => import('./pages/CoordinatorHome').then((m) => ({ default: m.CoordinatorHome })));
const TeacherHome = lazy(() => import('./pages/TeacherHome').then((m) => ({ default: m.TeacherHome })));
const Course = lazy(() => import('./pages/Course').then((m) => ({ default: m.Course })));
const Wizard = lazy(() => import('./pages/Wizard').then((m) => ({ default: m.Wizard })));
const Document = lazy(() => import('./pages/Document').then((m) => ({ default: m.Document })));
const TeacherCourseSubject = lazy(() =>
  import('./pages/TeacherCourseSubject').then((m) => ({ default: m.TeacherCourseSubject })),
);
const TeacherPlanWizard = lazy(() =>
  import('./pages/TeacherPlanWizard').then((m) => ({ default: m.TeacherPlanWizard })),
);
const TeacherLessonPlan = lazy(() =>
  import('./pages/TeacherLessonPlan').then((m) => ({ default: m.TeacherLessonPlan })),
);
const Resources = lazy(() => import('./pages/Resources').then((m) => ({ default: m.Resources })));
const ResourceCreate = lazy(() => import('./pages/ResourceCreate').then((m) => ({ default: m.ResourceCreate })));
const ResourceEditor = lazy(() => import('./pages/ResourceEditor').then((m) => ({ default: m.ResourceEditor })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })));
const CoordinatorDocuments = lazy(() =>
  import('./pages/CoordinatorDocuments').then((m) => ({ default: m.CoordinatorDocuments })),
);
const AdminHome = lazy(() => import('./pages/AdminHome').then((m) => ({ default: m.AdminHome })));
const AdminAreas = lazy(() => import('./pages/AdminAreas').then((m) => ({ default: m.AdminAreas })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

/** Try to load from API, fall back to mocks for local dev without backend */
async function loadOrgConfig(): Promise<void> {
  const setOrgConfig = useConfigStore.getState().setOrgConfig;
  try {
    const { config } = await orgApi.getConfig();
    setOrgConfig(config);
    applyVisualIdentity(config);
  } catch {
    console.warn('[Alizia] Backend unavailable — using mock org config');
    setOrgConfig(MOCK_ORG_CONFIG);
    applyVisualIdentity(MOCK_ORG_CONFIG);
  }
}

async function loadReferenceData(): Promise<void> {
  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: referenceKeys.courses,
        queryFn: async () => (await coursesApi.list()).items,
      }),
      queryClient.prefetchQuery({
        queryKey: referenceKeys.areas,
        queryFn: async () => (await areasApi.list()).items,
      }),
      queryClient.prefetchQuery({
        queryKey: referenceKeys.subjects,
        queryFn: async () => (await subjectsApi.list()).items,
      }),
      queryClient.prefetchQuery({
        queryKey: referenceKeys.topics,
        queryFn: async () => (await topicsApi.getTree()).items,
      }),
      queryClient.prefetchQuery({
        queryKey: coordinationKeys.all,
        queryFn: async () => (await coordinationDocumentsApi.list()).items,
      }),
      queryClient.prefetchQuery({
        queryKey: referenceKeys.courseSubjects,
        queryFn: async () => (await courseSubjectsApi.list()).items,
      }),
      queryClient.prefetchQuery({
        queryKey: referenceKeys.activitiesByMoment,
        queryFn: async () => {
          const [apertura, desarrollo, cierre] = await Promise.all([
            activitiesApi.list({ moment: 'apertura' }),
            activitiesApi.list({ moment: 'desarrollo' }),
            activitiesApi.list({ moment: 'cierre' }),
          ]);
          return { apertura: apertura.items, desarrollo: desarrollo.items, cierre: cierre.items };
        },
      }),
    ]);
  } catch {
    console.warn('[Alizia] Backend unavailable — using mock reference data');
    queryClient.setQueryData(referenceKeys.courses, MOCK_COURSES);
    queryClient.setQueryData(referenceKeys.areas, MOCK_AREAS);
    queryClient.setQueryData(referenceKeys.subjects, MOCK_SUBJECTS);
    queryClient.setQueryData(referenceKeys.topics, MOCK_TOPICS);
    queryClient.setQueryData(referenceKeys.courseSubjects, MOCK_COURSE_SUBJECTS);
    queryClient.setQueryData(referenceKeys.activitiesByMoment, MOCK_ACTIVITIES);
    queryClient.setQueryData(referenceKeys.fonts, MOCK_FONTS);
    queryClient.setQueryData(coordinationKeys.all, []);
    queryClient.setQueryData(resourceKeys.types, MOCK_RESOURCE_TYPES);
    queryClient.setQueryData(resourceKeys.all, MOCK_RESOURCES);
  }
}

function AppRoutes() {
  const user = useAuthStore((s) => s.user);
  const getUserRole = useAuthStore((s) => s.getUserRole);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  useEffect(() => {
    if (user) {
      setIsBootstrapping(true);
      Promise.all([loadOrgConfig(), loadReferenceData()]).finally(() => {
        setIsBootstrapping(false);
      });
    } else {
      useConfigStore.getState().reset();
      clearVisualIdentity();
      setIsBootstrapping(false);
    }
  }, [user]);

  const userRole = getUserRole();

  if (!user) {
    return (
      <RouteBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='*' element={<Navigate to='/login' replace />} />
          </Routes>
        </Suspense>
      </RouteBoundary>
    );
  }

  if (isBootstrapping) {
    return <LoadingFallback />;
  }

  return (
    <RouteBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path='/login' element={<Navigate to='/' replace />} />
          <Route
            path='/onboarding'
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path='/coordinator/courses/:id/documents/new'
            element={
              <ProtectedRoute roles={['coordinator']}>
                <Wizard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/coordinator/documents/new'
            element={
              <ProtectedRoute roles={['coordinator']}>
                <Wizard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/coordinator/documents/:id'
            element={
              <ProtectedRoute roles={['coordinator']}>
                <Document />
              </ProtectedRoute>
            }
          />
          <Route
            path='/teacher/plans/:id'
            element={
              <ProtectedRoute roles={['teacher']}>
                <RequireModule module='planificacion'>
                  <TeacherLessonPlan />
                </RequireModule>
              </ProtectedRoute>
            }
          />
          <Route
            path='/resources/new'
            element={
              <ProtectedRoute roles={['teacher']}>
                <RequireModule module='contenido'>
                  <ResourceCreate />
                </RequireModule>
              </ProtectedRoute>
            }
          />
          <Route
            path='/resources/:id'
            element={
              <ProtectedRoute roles={['teacher']}>
                <RequireModule module='contenido'>
                  <ResourceEditor />
                </RequireModule>
              </ProtectedRoute>
            }
          />
          <Route
            path='*'
            element={
              <ProtectedRoute>
                <MainLayout>
                  <RouteBoundary>
                    <Routes>
                      <Route
                        path='/'
                        element={
                          userRole === 'coordinator' ? (
                            <CoordinatorHome />
                          ) : userRole === 'teacher' ? (
                            <TeacherHome />
                          ) : userRole === 'admin' ? (
                            <AdminHome />
                          ) : (
                            <Navigate to='/login' replace />
                          )
                        }
                      />
                      <Route
                        path='/coordinator/documents'
                        element={userRole === 'coordinator' ? <CoordinatorDocuments /> : <Navigate to='/' replace />}
                      />
                      <Route
                        path='/admin/areas'
                        element={userRole === 'admin' ? <AdminAreas /> : <Navigate to='/' replace />}
                      />
                      <Route path='/coordinator/courses/:id' element={<Course />} />
                      <Route path='/teacher/courses/:id' element={<TeacherCourseSubject />} />
                      <Route
                        path='/teacher/courses/:csId/plans/:classNumber/new'
                        element={
                          <RequireModule module='planificacion'>
                            <TeacherPlanWizard />
                          </RequireModule>
                        }
                      />
                      <Route
                        path='/resources'
                        element={
                          <RequireModule module='contenido'>
                            <Resources />
                          </RequireModule>
                        }
                      />
                      <Route path='*' element={<NotFound />} />
                    </Routes>
                  </RouteBoundary>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </RouteBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster position='top-right' richColors closeButton />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
