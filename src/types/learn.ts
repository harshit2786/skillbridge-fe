/* eslint-disable @typescript-eslint/no-explicit-any */
// ─── Sidebar / Progress Types ────────────────────────────────────

export type ContentStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "grading"
  | "completed";

export interface SidebarQuiz {
  id: string;
  name: string;
  description: string | null;
  published: boolean;
  passingPercent: number;
}

export interface SidebarCourse {
  id: string;
  name: string;
  description: string | null;
  published: boolean;
}

export interface SidebarItem {
  contentId: string;
  position: number;
  type: "QUIZ" | "COURSE";
  quiz: SidebarQuiz | null;
  course: SidebarCourse | null;
  status: ContentStatus;
  currentSectionOrder?: number;
  totalScore?: number | null;
  maxScore?: number | null;
  passed?: boolean | null;
}

export interface TraineeProgressSummary {
  id: string;
  currentContentId: string | null;
  startedAt: string;
}

export interface GetProgressResponse {
  progress: TraineeProgressSummary | null;
  contents: SidebarItem[];
}

// ─── Start Learning ──────────────────────────────────────────────

export interface StartLearningResponse {
  message: string;
  progress: {
    id: string;
    traineeId: string;
    projectId: string;
    currentContentId: string | null;
    startedAt: string;
    updatedAt: string;
  };
}

// ─── Content Details ─────────────────────────────────────────────

export interface ContentSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  _count: { questions: number };
}

export interface ContentDetailQuiz {
  id: string;
  name: string;
  description: string | null;
  published: boolean;
  passingPercent: number;
  sections: ContentSection[];
}

export interface ContentDetailCourse {
  id: string;
  name: string;
  description: string | null;
  published: boolean;
  sections: ContentSection[];
}

export interface CourseProgressData {
  id: string;
  status: "IN_PROGRESS" | "COMPLETED";
  currentSectionOrder: number;
  startedAt: string;
  completedAt: string | null;
  completedQuestionIds: string[];
}

export interface QuizProgressData {
  id: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADED";
  currentSectionOrder: number;
  totalScore: number | null;
  maxScore: number | null;
  passed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
  submittedQuestionIds: string[];
}

export interface GetContentDetailsResponse {
  content: {
    id: string;
    type: "QUIZ" | "COURSE";
    position: number;
    quiz: ContentDetailQuiz | null;
    course: ContentDetailCourse | null;
  };
  progress: CourseProgressData | QuizProgressData | null;
  started: boolean;
}

// ─── Course Progress ─────────────────────────────────────────────

export interface CourseSectionOverview {
  id: string;
  title: string;
  description: string | null;
  order: number;
  totalQuestions: number;
  isUnlocked: boolean;
  isCurrent: boolean;
}

export interface GetCourseProgressResponse {
  course: {
    id: string;
    name: string;
    description: string | null;
  };
  progress: {
    id: string;
    status: "IN_PROGRESS" | "COMPLETED";
    currentSectionOrder: number;
    startedAt: string;
    completedAt: string | null;
  };
  sections: CourseSectionOverview[];
}

// ─── Course Section Questions ────────────────────────────────────

export interface CourseQuestionItem {
  id: string;
  type: string;
  question: string;
  order: number;
  data: any;
  completed: boolean;
}

export interface GetCourseSectionQuestionsResponse {
  section: {
    id: string;
    title: string;
    description: string | null;
    order: number;
  };
  questions: CourseQuestionItem[];
  sectionAutoComplete?: boolean;
}

// ─── Submit Course Answer ────────────────────────────────────────

export interface SubmitCourseAnswerRequest {
  answer: any;
}

export interface SubmitCourseAnswerResponse {
  correct: boolean;
  message: string;
  sectionCompleted?: boolean;
  courseCompleted?: boolean;
  nextSectionOrder?: number;
  completed?: boolean; // when already completed
}

// ─── Quiz Progress ───────────────────────────────────────────────

export interface QuizSectionOverview {
  id: string;
  title: string;
  description: string | null;
  order: number;
  totalQuestions: number;
  isUnlocked: boolean;
  isCurrent: boolean;
}

export interface GetQuizProgressResponse {
  quiz: {
    id: string;
    name: string;
    description: string | null;
    passingPercent: number;
  };
  attempt: {
    id: string;
    status: "IN_PROGRESS" | "SUBMITTED" | "GRADED";
    currentSectionOrder: number;
    totalScore: number | null;
    maxScore: number | null;
    passed: boolean | null;
    startedAt: string;
    submittedAt: string | null;
  };
  sections: QuizSectionOverview[];
}

// ─── Quiz Section Questions ──────────────────────────────────────

export interface QuizQuestionItem {
  id: string;
  type: string;
  question: string;
  points: number;
  order: number;
  data: any;
  submitted: boolean;
  submittedResponse: any | null;
}

export interface GetQuizSectionQuestionsResponse {
  section: {
    id: string;
    title: string;
    description: string | null;
    order: number;
  };
  questions: QuizQuestionItem[];
  attemptStatus: "IN_PROGRESS" | "SUBMITTED" | "GRADED";
  sectionAutoComplete?: boolean;
}

// ─── Submit Quiz Response ────────────────────────────────────────

export interface SubmitQuizResponseRequest {
  answer: any;
}

export interface SubmitQuizResponseResponse {
  message: string;
  sectionCompleted: boolean;
  isLastSection: boolean;
}

// ─── Complete Quiz ───────────────────────────────────────────────

export interface CompleteQuizResponse {
  message: string;
  status: "SUBMITTED";
}

// ─── Quiz Result ─────────────────────────────────────────────────

export interface QuizResultResponseItem {
  questionId: string;
  question: string;
  type: string;
  maxPoints: number;
  pointsAwarded: number | null;
  feedback: string | null;
  gradingStatus: "PENDING" | "AUTO_GRADED" | "AI_GRADED" | "MANUALLY_GRADED";
  response: any;
  section: {
    id: string;
    title: string;
    order: number;
  };
}

export interface GetQuizResultResponse {
  status: "SUBMITTED" | "GRADED";
  message?: string; // present when status is SUBMITTED
  quiz?: {
    name: string;
    passingPercent: number;
  };
  result?: {
    totalScore: number;
    maxScore: number;
    scorePercent: number;
    passed: boolean;
    feedback: string | null;
  };
  responses?: QuizResultResponseItem[];
  submittedAt?: string;
  gradedAt?: string;
}

export interface CompleteCourseSectionResponse {
  message: string;
  sectionCompleted: boolean;
  courseCompleted: boolean;
  nextSectionOrder?: number;
}