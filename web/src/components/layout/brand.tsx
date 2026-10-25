import { Wind } from "lucide-react";

export const Brand = () => (
  <div className="flex items-center gap-3">
    <div className="border-primary bg-primary text-primary-foreground flex size-9 items-center justify-center border">
      <Wind className="size-5" />
    </div>
    <span className="font-semibold tracking-tight">Wind Intelligence</span>
  </div>
);
