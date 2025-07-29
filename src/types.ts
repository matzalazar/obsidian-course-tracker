// src/types.ts
export interface Lesson {
  title: string;
  duration: string;
}

export interface Module {
  module: string;
  lessons: Lesson[];
}

export interface Course {
  title: string;
  url: string;
  modules: Module[];
}

export interface CourseTrackerSettings {
  pythonPath: string;
}
