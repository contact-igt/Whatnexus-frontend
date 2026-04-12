import { promptApiData } from "@/services/prompt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";

const PromptApis = new promptApiData();

const MAX_PROMPT_CHARS = 60000;
const MAX_NAME_CHARS = 80;

const getPromptValidationError = (data: any) => {
  const name = typeof data?.name === "string" ? data.name.trim() : "";
  const prompt = typeof data?.prompt === "string" ? data.prompt.trim() : "";

  if (!name) return "Prompt name is required.";
  if (name.length < 3) return "Prompt name must be at least 3 characters long.";
  if (name.length > MAX_NAME_CHARS) {
    return `Prompt name must not exceed ${MAX_NAME_CHARS} characters.`;
  }

  if (!prompt) return "Prompt content is required.";
  if (prompt.length < 10) return "Prompt must be at least 10 characters long.";
  if (prompt.length > MAX_PROMPT_CHARS) {
    return `Prompt must not exceed ${MAX_PROMPT_CHARS} characters.`;
  }

  return null;
};

export const useCreatePromptMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      const validationError = getPromptValidationError(data);
      if (validationError) {
        throw new Error(validationError);
      }

      return PromptApis.createPrompt({
        name: data.name.trim(),
        prompt: data.prompt.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-configurations"] });
      toast.success("Prompt updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update prompt",
      );
    },
  });
};

export const useActivatePromptMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      return PromptApis.activatePromptById(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-configurations"] });
      toast.success("Prompt status updated successfully!");
    },
    onError: (error: any) => {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to update prompt status");
    },
  });
};

export const useDeletePromptMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return PromptApis.deletePromptById(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-configurations"] });
      queryClient.invalidateQueries({ queryKey: ["deleted-prompt-configurations"] });
      toast.success("Prompt deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Failed to delete prompt");
    },
  });
};

export const useGetPromptConfigurationQuery = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["prompt-configurations"],
    queryFn: () => PromptApis.getAllPrompts(),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      toast.error(error instanceof Error ? error.message : "Failed to load prompt configurations");
    }
  }, [isError, error]);

  return { data, isLoading, isError };
};

export const usePromptByIdQuery = (id: string, type: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["prompt-configurations", id],
    queryFn: () => PromptApis.getPromptById(id),
    enabled: !!id && type == "prompt",
    staleTime: 3 * 60 * 1000,
  });
  return { data, isLoading, isError };
};

export const useUpdatePromptMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      const validationError = getPromptValidationError(data);
      if (validationError) {
        throw new Error(validationError);
      }

      return PromptApis.updatePromptById(id, {
        name: data.name.trim(),
        prompt: data.prompt.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-configurations"] });
      toast.success("Prompt updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update prompt",
      );
    },
  });
};

export const useDeletedPromptList = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["deleted-prompt-configurations"],
    queryFn: () => PromptApis.getDeletedPrompts(),
    staleTime: 2 * 60 * 1000,
  });

  return { data, isLoading, isError };
};

export const useDeletePromptPermanentById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PromptApis.deletePromptPermanentById(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted-prompt-configurations"] });
      toast.success("Prompt deleted successfully");
    },

    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete knowledge");
    },
  });
};

export const useRestorePromptById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PromptApis.restorePromptById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-configurations"] });
      queryClient.invalidateQueries({ queryKey: ["deleted-prompt-configurations"] });
      toast.success("Prompt restored successfully");
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Failed to restore prompt");
    },
  });
};
