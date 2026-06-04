import type * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <Alert>
      <AlertDescription className="text-muted-foreground">{children}</AlertDescription>
    </Alert>
  );
}
