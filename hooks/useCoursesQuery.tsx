import { CoursesApiData } from "@/services/courses";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useSelector } from "react-redux";
import type {
  CreateCourseDto,
  UpdateCourseDto,
  CreateMentorDto,
  UpdateMentorDto,
} from "@/services/courses/courses.types";

const coursesApi = new CoursesApiData();

/* ── Queries ─────────────────────────────────────────────────── */
export const useGetAllCoursesQuery = () => {
  const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
  return useQuery({
    queryKey: ["courses", tenantId],
    queryFn:  () => coursesApi.getAllCourses(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetAllMentorsQuery = () => {
  const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
  return useQuery({
    queryKey: ["course-mentors", tenantId],
    queryFn:  () => coursesApi.getAllMentors(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/* ── Course Mutations ────────────────────────────────────────── */
export const useCreateCourseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseDto) => coursesApi.createCourse(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(data?.message || "Course created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create course.");
    },
  });
};

export const useUpdateCourseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseDto }) =>
      coursesApi.updateCourse(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(data?.message || "Course updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update course.");
    },
  });
};

export const useDeleteCourseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesApi.deleteCourse(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(data?.message || "Course deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete course.");
    },
  });
};

/* ── Mentor Mutations ────────────────────────────────────────── */
export const useCreateMentorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMentorDto) => coursesApi.createMentor(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course-mentors"] });
      toast.success(data?.message || "Mentor created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create mentor.");
    },
  });
};

export const useUpdateMentorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMentorDto }) =>
      coursesApi.updateMentor(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course-mentors"] });
      toast.success(data?.message || "Mentor updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update mentor.");
    },
  });
};

export const useDeleteMentorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesApi.deleteMentor(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course-mentors"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(data?.message || "Mentor deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete mentor.");
    },
  });
};
