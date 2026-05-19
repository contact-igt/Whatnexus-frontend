import { _axios } from "@/helper/axios";
import type {
  Course,
  Mentor,
  CreateCourseDto,
  UpdateCourseDto,
  CreateMentorDto,
  UpdateMentorDto,
  ApiResponse,
  CoursesListResponse,
  MentorsListResponse,
} from "./courses.types";

export class CoursesApiData {
  /* ── Courses ─────────────────────────────────────────────── */
  getAllCourses = (): Promise<CoursesListResponse> =>
    _axios("get", "/whatsapp/courses");

  createCourse = (data: CreateCourseDto): Promise<ApiResponse<Course>> =>
    _axios("post", "/whatsapp/courses", data);

  updateCourse = (id: string, data: UpdateCourseDto): Promise<ApiResponse<Course>> =>
    _axios("put", `/whatsapp/courses/${id}`, data);

  deleteCourse = (id: string): Promise<ApiResponse<null>> =>
    _axios("delete", `/whatsapp/courses/${id}`);

  /* ── Mentors ─────────────────────────────────────────────── */
  getAllMentors = (): Promise<MentorsListResponse> =>
    _axios("get", "/whatsapp/courses/mentors");

  createMentor = (data: CreateMentorDto): Promise<ApiResponse<Mentor>> =>
    _axios("post", "/whatsapp/courses/mentors", data);

  updateMentor = (id: string, data: UpdateMentorDto): Promise<ApiResponse<Mentor>> =>
    _axios("put", `/whatsapp/courses/mentors/${id}`, data);

  deleteMentor = (id: string): Promise<ApiResponse<null>> =>
    _axios("delete", `/whatsapp/courses/mentors/${id}`);
}
