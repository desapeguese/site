import "next-auth";

import { Class, Student, Subject, Teacher } from "./types";

export type FormDataEntries = Record<string, string | number | boolean>;

export interface PostAndPutActionProps<T> {
  success: boolean;
  message: string;
  fields?: Record<string, FormDataEntryValue>;
  issues?: ApiErrorDetail[];
  responseData?: T;
}

export interface GetActionProps<T> {
  success: boolean;
  message: string;
  responseData?: T;
  issues?: ApiErrorDetail[];
}

declare global {
  type FormDataEntries = Record<string, string | number | boolean>;
  type PostAndPutActionProps<T> = {
    success: boolean;
    message: string;
    fields?: Record<string, FormDataEntryValue>;
    issues?: ApiErrorDetail[];
    responseData?: T;
  };
  type GetActionProps<T> = {
    success: boolean;
    message: string;
    responseData?: T;
    issues?: ApiErrorDetail[];
  };
}

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    subjects?: Subject[];
    class?: Class[];
    teacherInfos?: Teacher;
    studentInfos?: Student;
    studentId?: string;
  }

  interface Session {
    user: User;
    accessToken: string;
    refreshToken: string;
  }
}
