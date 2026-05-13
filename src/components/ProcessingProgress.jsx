import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const ProcessingProgress = ({ current, total, currentFileName }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <span className="font-semibold text-foreground">Processing Exam Sheets...</span>
      </div>
      <Progress value={percentage} className="h-3" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Processing: {currentFileName}</span>
        <span>
          {current} / {total} ({percentage}%)
        </span>
      </div>
    </div>
  );
};

export default ProcessingProgress;
