import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { validateSheet } from "@/utils/validation";
import { exportToExcel } from "@/utils/excelExport";
import ImageUploader from "@/components/ImageUploader";
import ProcessingProgress from "@/components/ProcessingProgress";
import ResultsTable from "@/components/ResultsTable";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ScanLine, LogOut, User } from "lucide-react";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const Index = () => {
  const { user, logout } = useAuth();
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState("");
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const processFiles = useCallback(async (files) => {
    setPendingFiles((prev) => [...prev, ...files]);
  }, []);

  const startProcessing = useCallback(async () => {
    if (pendingFiles.length === 0) return;

    setIsProcessing(true);
    setProcessedCount(0);
    setTotalCount(pendingFiles.length);
    const newResults = [];

    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i];
      setCurrentFile(file.name);
      setProcessedCount(i);

      try {
        const base64 = await fileToBase64(file);
        const preview = URL.createObjectURL(file);

        const { data, error } = await supabase.functions.invoke("ocr-extract", {
          body: { imageBase64: base64 },
        });

        if (error) {
          newResults.push({
            fileName: file.name,
            ocrData: null,
            regulation: null,
            calculatedTotal: 0,
            writtenTotal: null,
            bubbleTotal: null,
            status: "ERROR",
            remarks: `OCR failed: ${error.message}`,
            imagePreview: preview,
          });
        } else if (data?.error) {
          newResults.push({
            fileName: file.name,
            ocrData: null,
            regulation: null,
            calculatedTotal: 0,
            writtenTotal: null,
            bubbleTotal: null,
            status: "ERROR",
            remarks: `OCR error: ${data.error}`,
            imagePreview: preview,
          });
        } else {
          const result = validateSheet(file.name, data, preview);
          newResults.push(result);
        }
      } catch (err) {
        newResults.push({
          fileName: file.name,
          ocrData: null,
          regulation: null,
          calculatedTotal: 0,
          writtenTotal: null,
          bubbleTotal: null,
          status: "ERROR",
          remarks: `Unexpected error: ${err.message || "Unknown"}`,
          imagePreview: "",
        });
      }

      setResults((prev) => [...prev.filter((r) => !newResults.find((n) => n.fileName === r.fileName)), ...newResults]);
    }

    setProcessedCount(pendingFiles.length);
    setIsProcessing(false);
    setPendingFiles([]);

    toast({
      title: "Processing Complete",
      description: `${newResults.length} sheet(s) processed successfully.`,
    });

    setShowExportDialog(true);
  }, [pendingFiles]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ScanLine className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">
                Exam Sheet Validator
              </h1>
              <p className="text-xs text-muted-foreground">
                OCR-powered answer sheet validation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {results.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                className="hidden md:flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </Button>
            )}

            <div className="h-8 w-px bg-border mx-2 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.displayName?.[0] || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Upload Section */}
        <ImageUploader onFilesSelected={processFiles} disabled={isProcessing} />

        {/* Start Button */}
        {pendingFiles.length > 0 && !isProcessing && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={startProcessing}
              className="px-8 h-14 rounded-xl font-semibold text-lg shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all"
            >
              Process {pendingFiles.length} Sheet{pendingFiles.length > 1 ? "s" : ""}
            </Button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <ProcessingProgress
            current={processedCount}
            total={totalCount}
            currentFileName={currentFile}
          />
        )}

        {/* Results */}
        <ResultsTable results={results} />
      </main>

      {/* Export Dialog */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Results to Excel?</AlertDialogTitle>
            <AlertDialogDescription>
              Download a detailed Excel report with all question marks, totals,
              validation status, and a summary sheet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Now</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => exportToExcel(results)}
              className="bg-accent text-accent-foreground hover:opacity-90"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Excel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
