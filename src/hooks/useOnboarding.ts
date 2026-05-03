import { useState, useEffect } from "react";

const ONBOARDING_KEY = "pmc_onboarding_completed";

export type OnboardingStep = "upload" | "position" | "filter" | "checkout" | "done";

const STEPS: OnboardingStep[] = ["upload", "position", "filter", "checkout"];

export function useOnboarding() {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setIsFirstVisit(true);
      setCurrentStep("upload");
      setIsModalOpen(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsModalOpen(false);
    setCurrentStep("done");
    setIsFirstVisit(false);
  };

  const advanceStep = () => {
    if (!currentStep) return;
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
    } else {
      completeOnboarding();
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const stepIndex = currentStep && currentStep !== "done"
    ? STEPS.indexOf(currentStep)
    : -1;

  const totalSteps = STEPS.length;

  return {
    isFirstVisit,
    currentStep,
    isModalOpen,
    stepIndex,
    totalSteps,
    advanceStep,
    skipOnboarding,
  };
}
