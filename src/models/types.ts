// src/models/types.ts

// --- Auth Payloads ---

export interface TrainerLoginRequest {
  email: string;
  password: string;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface UpdateTraineeRequest {
  name: string;
}

// --- Entities ---

export interface ProjectRef {
  id: string;
  name: string;
}

export interface Trainer {
  id: string;
  email: string;
  name: string;
  projects_trainer?: ProjectRef[];
  project_admin?: ProjectRef[];
}

export interface Trainee {
  id: string;
  phone: string;
  name: string | null;
  projects_trainee?: ProjectRef[];
}

// --- Auth Responses ---

export interface TrainerLoginResponse {
  message: string;
  token: string;
  trainer: Trainer;
}

export interface TrainerMeResponse {
  trainer: Trainer;
}

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  isNewUser: boolean;
  token: string;
  trainee: Trainee;
}

export interface TraineeMeResponse {
  trainee: Trainee;
}

export interface UpdateTraineeResponse {
  message: string;
  trainee: Trainee;
}

// --- Unified Auth User (used in context) ---

export type UserRole = "trainer" | "trainee";

export interface AuthUser {
  role: UserRole;
  token: string;
  trainer?: Trainer;
  trainee?: Trainee;
}

// --- API Error ---

export interface ApiError {
  message: string;
}

export interface Project {
  id: string;
  name: string;
}

// src/models/types.ts — add these

export interface ProjectDetail {
  id: string;
  name: string;
  description?: string;
  trainers: Trainer[];
  trainees: Trainee[];
  admin: Trainer;
}

export interface ProjectDetailResponse {
  project: ProjectDetail;
}

export type ResourceStatus = "PROCESSING" | "PROCESSED" | "FAILED";

export interface ResourceUploader {
  id: string;
  name: string;
  email: string;
}

export interface Resource {
  id: string;
  filename: string;
  url: string;
  size: number;
  status: ResourceStatus;
  createdAt: string;
  uploader: ResourceUploader;
}

export interface ResourceDetail extends Resource {
  refId: string;
  mimeType: string;
  projectId: string;
  uploadedBy: string;
  errorMsg: string | null;
}

export interface ResourceListResponse {
  resources: Resource[];
}

export interface ResourceDetailResponse {
  resource: ResourceDetail;
}

export interface ResourceUploadResponse {
  message: string;
  resource: {
    id: string;
    filename: string;
    status: ResourceStatus;
    createdAt: string;
  };
}

export interface DeleteResourceResponse {
  message: string;
}

// src/models/types.ts — add these

export interface ChatSource {
  id: string;
  resourceId: string;
  filename: string;
  url: string;
  chunkText?: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  sources: ChatSource[];
}

export interface Chat {
  id: string;
  title: string;
  projectId: string;
  traineeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatWithCount extends Chat {
  _count: {
    messages: number;
  };
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessage[];
}

export interface ChatListResponse {
  chats: ChatWithCount[];
}

export interface ChatDetailResponse {
  chat: ChatWithMessages;
}

export interface CreateChatRequest {
  title?: string;
}

export interface CreateChatResponse {
  message: string;
  chat: Chat;
}

export interface DeleteChatResponse {
  message: string;
}

// SSE Event Types
export interface SSEUserMessageEvent {
  type: "user_message";
  messageId: string;
}

export interface SSEStatusEvent {
  type: "status";
  message: string;
}

export interface SSEChunkEvent {
  type: "chunk";
  content: string;
}

export interface SSETitleEvent {
  type: "title";
  title: string;
}

export interface SSESourcesEvent {
  type: "sources";
  messageId: string;
  sources: ChatSource[];
}

export interface SSEDoneEvent {
  type: "done";
  messageId: string;
}

export interface SSEErrorEvent {
  type: "error";
  message: string;
}

export type SSEEvent =
  | SSEUserMessageEvent
  | SSEStatusEvent
  | SSEChunkEvent
  | SSETitleEvent
  | SSESourcesEvent
  | SSEDoneEvent
  | SSEErrorEvent;

// src/models/types.ts — add these

export interface QuizCreator {
  id: string;
  name: string;
  email: string;
}

export interface Quiz {
  id: string;
  name: string;
  description: string;
  projectId: string;
  published: boolean;
  passingPercent: number;
  createdAt: string;
  creators: QuizCreator[];
  content: {
    position: number;
  };
}

export interface QuizSection {
  id: string;
  quizId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    questions: number;
  };
}

export interface QuizWithSections extends Quiz {
  sections: QuizSection[];
}

export interface QuizListResponse {
  quizzes: Quiz[];
}

export interface QuizDetailResponse {
  quiz: QuizWithSections;
}

export interface CreateQuizRequest {
  name: string;
  description?: string;
  passingPercent?: number;
  creatorIds?: string[];
}

export interface CreateQuizResponse {
  message: string;
  quiz: Quiz;
  position: number;
}

export interface AddCreatorsRequest {
  trainerIds: string[];
}

export interface AddCreatorsResponse {
  message: string;
  creators: QuizCreator[];
}

export interface RemoveCreatorResponse {
  message: string;
}

export interface TogglePublishResponse {
  message: string;
  quiz: Quiz;
}

export interface CreateSectionRequest {
  title: string;
  description?: string;
}

export interface CreateSectionResponse {
  message: string;
  section: QuizSection;
}

export interface UpdateSectionRequest {
  title?: string;
  description?: string;
}

export interface UpdateSectionResponse {
  message: string;
  section: QuizSection;
}

export interface DeleteSectionResponse {
  message: string;
}

export interface ReorderSectionItem {
  sectionId: string;
  order: number;
}

export interface ReorderSectionsRequest {
  order: ReorderSectionItem[];
}

export interface ReorderSectionsResponse {
  message: string;
  sections: QuizSection[];
}

// src/models/types.ts — add these

export type ContentType = "quizzes" | "courses";

export interface Course {
  id: string;
  name: string;
  description: string;
  projectId: string;
  published: boolean;
  createdAt: string;
  creators: QuizCreator[]; // same shape as quiz creators
  content: {
    position: number;
  };
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    questions: number;
  };
}

export interface CourseWithSections extends Course {
  sections: CourseSection[];
}

export interface CourseListResponse {
  courses: Course[];
}

export interface CourseDetailResponse {
  course: CourseWithSections;
}

export interface CreateCourseRequest {
  name: string;
  description?: string;
  creatorIds?: string[];
}

export interface CreateCourseResponse {
  message: string;
  course: Course;
  position: number;
}

// src/models/types.ts — add these

export interface ProjectContent {
  id: string;
  projectId: string;
  type: "QUIZ" | "COURSE";
  position: number;
  quizId: string | null;
  courseId: string | null;
  quiz: {
    id: string;
    name: string;
    description: string | null;
    published: boolean;
    creators: QuizCreator[];
  } | null;
  course: {
    id: string;
    name: string;
    description: string | null;
    published: boolean;
    creators: QuizCreator[];
  } | null;
}

export interface ProjectContentsResponse {
  contents: ProjectContent[];
}

export interface ReorderContentItem {
  contentId: string;
  position: number;
}

export interface ReorderContentsRequest {
  order: ReorderContentItem[];
}

export interface ReorderContentsResponse {
  message: string;
  contents: ProjectContent[];
}