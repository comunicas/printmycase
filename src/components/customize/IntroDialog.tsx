import { useEffect } from "react";

interface IntroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IntroDialog = ({ onOpenChange }: IntroDialogProps) => {
  useEffect(() => {
    localStorage.setItem("customize_intro_seen", "true");
    onOpenChange(false);
  }, [onOpenChange]);

  return null;
};

export default IntroDialog;
