import { useCallback, useEffect, useState } from "react";
import { uploadForAI } from "@/lib/image-utils";
import type { AiFilter, AiFilterCategory, FilterHistoryEntry } from "@/lib/customize-types";
import { fetchActiveAiFilterCategories, fetchActiveAiFilters } from "@/services/customize/filters";
import { invokeApplyAiFilter, invokeUpscaleImage } from "@/services/customize/ai";
import { supabase } from "@/integrations/supabase/client";

type ToastFn = (payload: { title: string; description?: string; variant?: "destructive" }) => void;

type UseCustomizeFiltersParams = {
  userId?: string;
  navigate: (url: string) => void;
  toast: ToastFn;
  image: string | null;
  originalImage: string | null;
  imageResolution: { w: number; h: number } | null;
  isHD: boolean;
  filterHistory: FilterHistoryEntry[];
  activeFilterId: string | null;
  coinBalance: number;
  aiFilterCost: number;
  aiUpscaleCost: number;
  sessionId: string;
  refreshCoins: () => Promise<void>;
  setImageWithResolution: (src: string) => Promise<void>;
  setImage: (value: string | null) => void;
  setOriginalImage: (value: string | null) => void;
  setFilteredImage: (value: string | null) => void;
  setActiveFilterId: (value: string | null) => void;
  setFilterHistory: (value: FilterHistoryEntry[] | ((prev: FilterHistoryEntry[]) => FilterHistoryEntry[])) => void;
  requireAuth: (reason: "filter" | "upscale") => boolean;
};

export function useCustomizeFilters(params: UseCustomizeFiltersParams) {
  const {
    userId,
    navigate,
    toast,
    image,
    originalImage,
    imageResolution,
    isHD,
    filterHistory,
    activeFilterId,
    coinBalance,
    aiFilterCost,
    aiUpscaleCost,
    sessionId,
    refreshCoins,
    setImageWithResolution,
    setImage,
    setOriginalImage,
    setFilteredImage,
    setActiveFilterId,
    setFilterHistory,
    requireAuth,
  } = params;

  const [filters, setFilters] = useState<AiFilter[]>([]);
  const [filterCategories, setFilterCategories] = useState<AiFilterCategory[]>([]);
  const [pendingFilterId, setPendingFilterId] = useState<string | null>(null);
  const [applyingFilterId, setApplyingFilterId] = useState<string | null>(null);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [showUpscaleDialog, setShowUpscaleDialog] = useState(false);
  const [processingMsg, setProcessingMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveAiFilters().then(setFilters).catch((error) => {
      console.error("Erro ao carregar filtros de IA", error);
    });

    fetchActiveAiFilterCategories().then(setFilterCategories).catch((error) => {
      console.error("Erro ao carregar categorias de filtro", error);
    });
  }, []);

  const handleCompareStart = useCallback(() => {
    if (originalImage && (activeFilterId || filterHistory.length > 0)) setImage(originalImage);
  }, [originalImage, activeFilterId, filterHistory, setImage]);

  const handleCompareEnd = useCallback(() => {
    const lastImage = filterHistory[filterHistory.length - 1]?.image;
    if (lastImage && (activeFilterId || filterHistory.length > 0)) setImage(lastImage);
  }, [activeFilterId, filterHistory, setImage]);

  const handleRemoveFilter = useCallback(() => {
    if (!originalImage) return;
    setImage(originalImage);
    setActiveFilterId(null);
    setFilteredImage(null);
    setFilterHistory([]);
  }, [originalImage, setImage, setActiveFilterId, setFilteredImage, setFilterHistory]);

  const handleUndoLastFilter = useCallback(() => {
    if (filterHistory.length <= 1) {
      handleRemoveFilter();
      return;
    }

    const newHistory = filterHistory.slice(0, -1);
    const prev = newHistory[newHistory.length - 1];
    setFilterHistory(newHistory);
    setImage(prev.image);
    setFilteredImage(prev.image);
    setActiveFilterId(prev.filterId);
  }, [filterHistory, handleRemoveFilter, setFilterHistory, setImage, setFilteredImage, setActiveFilterId]);

  const handleFilterClick = useCallback((filterId: string) => {
    if (!requireAuth("filter")) return;
    if (!image || applyingFilterId) return;

    if (activeFilterId === filterId && filterHistory.length > 0) {
      handleUndoLastFilter();
      return;
    }

    const selectedFilter = filters.find((f) => f.id === filterId);
    const isUpscaleFilter = selectedFilter?.model_url?.includes("aura-sr");

    if (!isUpscaleFilter && imageResolution && (imageResolution.w < 256 || imageResolution.h < 256)) {
      toast({
        title: "Resolução muito baixa para este filtro",
        description: "Sua imagem tem menos de 256×256px. Aplique o filtro Upscale IA primeiro para aumentar a resolução e depois tente novamente.",
      });
      return;
    }

    setPendingFilterId(filterId);
  }, [requireAuth, image, applyingFilterId, activeFilterId, filterHistory, handleUndoLastFilter, imageResolution, toast]);

  const handleFilterConfirm = useCallback(async () => {
    if (!pendingFilterId || !image || !userId) return;

    const filterId = pendingFilterId;
    setPendingFilterId(null);
    setApplyingFilterId(filterId);
    setProcessingMsg("Enviando imagem...");

    try {
      const { signedUrl } = await uploadForAI(image, userId, supabase);
      setProcessingMsg("Aplicando filtro IA...");
      const stepNumber = filterHistory.length + 1;
      const { data, error } = await invokeApplyAiFilter({ imageUrl: signedUrl, filterId, stepNumber, sessionId });

      if (error || (!data?.imageUrl && !data?.image)) {
        const isInsufficientCoins = data?.error === "Saldo insuficiente" || error?.message?.includes("402");
        toast({
          title: isInsufficientCoins ? "Moedas insuficientes" : "Erro ao aplicar filtro",
          description: isInsufficientCoins ? "Compre mais moedas para usar filtros IA." : "Nenhuma moeda foi debitada. Tente gerar novamente.",
          variant: "destructive",
        });
        if (isInsufficientCoins) navigate("/coins");
        return;
      }

      const resultImage = data.imageUrl || data.image;
      if (!originalImage) setOriginalImage(image);
      await setImageWithResolution(resultImage);
      setFilteredImage(resultImage);
      setActiveFilterId(filterId);

      const filterObj = filters.find((f) => f.id === filterId);
      setFilterHistory((prev) => [...prev, { filterId, image: resultImage, filterName: filterObj?.name }]);

      await refreshCoins();
      const newBalance = coinBalance - aiFilterCost;
      if (newBalance < Math.min(aiFilterCost, aiUpscaleCost)) {
        toast({ title: "Suas moedas estão acabando! 🪙", description: "Compre mais ou indique amigos para ganhar moedas grátis." });
      }
    } catch {
      toast({ title: "Erro ao aplicar filtro", description: "Nenhuma moeda foi debitada. Tente gerar novamente.", variant: "destructive" });
    } finally {
      setApplyingFilterId(null);
      setProcessingMsg(null);
    }
  }, [pendingFilterId, image, userId, filterHistory.length, sessionId, toast, navigate, originalImage, setOriginalImage, setImageWithResolution, setFilteredImage, setActiveFilterId, filters, setFilterHistory, refreshCoins, coinBalance, aiFilterCost, aiUpscaleCost]);

  const handleUpscaleClick = useCallback(() => {
    if (!requireAuth("upscale")) return;
    if (!image || isUpscaling || isHD) return;
    setShowUpscaleDialog(true);
  }, [requireAuth, image, isUpscaling, isHD]);

  const handleUpscaleConfirm = useCallback(async () => {
    if (!image || !userId) return;
    setShowUpscaleDialog(false);
    setIsUpscaling(true);
    setProcessingMsg("Enviando imagem...");

    try {
      const sourceImage = originalImage || image;
      const { signedUrl } = await uploadForAI(sourceImage, userId, supabase);
      const { data, error } = await invokeUpscaleImage({ imageUrl: signedUrl, stepNumber: filterHistory.length + 1, sessionId });

      if (error || (!data?.imageUrl && !data?.image)) {
        const isInsufficientCoins = data?.error === "Saldo insuficiente" || error?.message?.includes("402");
        toast({
          title: isInsufficientCoins ? "Moedas insuficientes" : "Erro no upscale",
          description: isInsufficientCoins ? "Compre mais moedas para usar o upscale IA." : "Nenhuma moeda foi debitada. Tente gerar novamente.",
          variant: "destructive",
        });
        if (isInsufficientCoins) navigate("/coins");
        return;
      }

      const resultImage = data.imageUrl || data.image;
      setOriginalImage(resultImage);
      await setImageWithResolution(resultImage);
      setActiveFilterId(null);
      await refreshCoins();
    } catch {
      toast({ title: "Erro no upscale", description: "Nenhuma moeda foi debitada. Tente gerar novamente.", variant: "destructive" });
    } finally {
      setIsUpscaling(false);
      setProcessingMsg(null);
    }
  }, [image, userId, originalImage, filterHistory.length, sessionId, toast, navigate, setOriginalImage, setImageWithResolution, setActiveFilterId, refreshCoins]);

  return {
    filters,
    filterCategories,
    pendingFilterId,
    setPendingFilterId,
    applyingFilterId,
    isUpscaling,
    showUpscaleDialog,
    setShowUpscaleDialog,
    processingMsg,
    handleFilterClick,
    handleFilterConfirm,
    handleCompareStart,
    handleCompareEnd,
    handleRemoveFilter,
    handleUndoLastFilter,
    handleUpscaleClick,
    handleUpscaleConfirm,
  };
}
