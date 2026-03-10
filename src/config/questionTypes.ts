import {
  ListChecks,
  TextCursorInput,
  ToggleLeft,
  AlignLeft,
  BookText,
} from "lucide-react";
import type { QuestionTypeConfig } from "@/types/quiz";

export const questionTypeConfigs: QuestionTypeConfig[] = [
  {
    id: "mcq",
    label: "Multiple Choice",
    description: "Question with multiple options and one correct answer",
    icon: ListChecks,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "fill_ups",
    label: "Fill in the Blanks",
    description: "Students fill in missing words or phrases",
    icon: TextCursorInput,
    iconColor: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  {
    id: "true_false",
    label: "True or False",
    description: "A statement that is either true or false",
    icon: ToggleLeft,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    id: "long_answer",
    label: "Long Answer",
    description: "Requires a detailed written response",
    icon: AlignLeft,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    id: "content_block",
    label: "Content Block",
    description: "Informational content with rich text, code, and media",
    icon: BookText,
    iconColor: "text-pink-600",
    bgColor: "bg-pink-100",
  },
];