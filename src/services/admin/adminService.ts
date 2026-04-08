import { supabase } from "@/integrations/supabase/client";
import { fail, ok, type ServiceResult } from "@/services/shared";

type OptimizeExistingImagesResponse = {
  optimized: number;
  errors: number;
};

export const adminService = {
  async optimizeExistingImages(): Promise<ServiceResult<OptimizeExistingImagesResponse>> {
    const { data, error } = await supabase.functions.invoke("optimize-existing-images");

    if (error) {
      return fail({ code: "FUNCTION", message: `Erro ao otimizar imagens: ${error.message}`, cause: error });
    }

    return ok({
      optimized: Number(data?.optimized ?? 0),
      errors: Number(data?.errors ?? 0),
    });
  },

  async checkIsAdmin(userId: string): Promise<ServiceResult<boolean>> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      return fail({ code: "DATABASE", message: `Erro ao validar permissão de admin: ${error.message}`, cause: error });
    }

    return ok(Boolean(data));
  },
};
