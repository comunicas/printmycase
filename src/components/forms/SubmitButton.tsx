import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface SubmitButtonProps extends Omit<ButtonProps, "type"> {
  loading?: boolean;
  children: ReactNode;
}

const SubmitButton = ({ loading, children, disabled, ...props }: SubmitButtonProps) => (
  <Button type="submit" disabled={loading || disabled} {...props}>
    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {children}
  </Button>
);

export default SubmitButton;
