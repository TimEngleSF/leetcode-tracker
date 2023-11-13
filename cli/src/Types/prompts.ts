export interface RegistrationPrompt {
  email: string;
  username: string;
  firstName: string;
  lastInit: string;
  password: string;
}

export interface QuestionAnswer {
  questNum: number;
  diff: number;
  passed: boolean;
  speed: number | null;
}
