import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FormCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "destructive";
}

const FormCard = ({ title, description, children, className, variant = "default" }: FormCardProps) => (
  <Card className={cn(variant === "destructive" && "border-destructive/50", className)}>
    <CardHeader>
      <CardTitle className={cn("text-lg", variant === "destructive" && "text-destructive")}>
        {title}
      </CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default FormCard;
