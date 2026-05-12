export type Level    = "Beginner" | "Intermediate" | "Advanced";
export type Status   = "Active" | "Draft" | "Archived";
export type Category =
  | "Technology"
  | "Healthcare"
  | "Marketing"
  | "Design"
  | "Business"
  | "Finance"
  | "Science";

export interface Mentor {
  id:        string;
  name:      string;
  initials:  string;
  color:     string;
  expertise: Category;
  rating:    number;
}

export interface Course {
  id:          string;
  title:       string;
  category:    Category;
  level:       Level;
  mentorId:    string;
  lessons:     number;
  duration:    string;
  price:       number;
  description: string;
  status:      Status;
  enrolled:    number;
  completion:  number;
  registrationLink?: string | null;
  meetingLink?: string | null;
  createdAt?:  string;
}

export interface CreateCourseDto {
  title:       string;
  category:    Category;
  level:       Level;
  mentorId:    string;
  lessons:     number;
  duration:    string;
  price:       number;
  description: string;
  status:      Status;
  registrationLink?: string | null;
  meetingLink?: string | null;
}

export type UpdateCourseDto = Partial<CreateCourseDto>;

export interface CreateMentorDto {
  name:      string;
  expertise: Category;
  rating:    number;
  color:     string;
}

export type UpdateMentorDto = Partial<CreateMentorDto>;

export interface ApiResponse<T> {
  message: string;
  data:    T;
}

export interface CoursesListResponse {
  message: string;
  data:    Course[];
}

export interface MentorsListResponse {
  message: string;
  data:    Mentor[];
}
