import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const ResultsTable = ({ results }) => {
  if (results.length === 0) return null;

  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  const errored = results.filter((r) => r.status === "ERROR").length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{results.length}</p>
          <p className="text-sm text-muted-foreground">Total Sheets</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-success">{passed}</p>
          <p className="text-sm text-muted-foreground">Passed</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{failed}</p>
          <p className="text-sm text-muted-foreground">Failed</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{errored}</p>
          <p className="text-sm text-muted-foreground">Errors</p>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Image</TableHead>
                <TableHead className="font-semibold text-center">Regulation</TableHead>
                <TableHead className="font-semibold">Question Marks</TableHead>
                <TableHead className="font-semibold text-center">Calc. Total</TableHead>
                <TableHead className="font-semibold text-center">Written Total</TableHead>
                <TableHead className="font-semibold text-center">Bubble Total</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={r.imagePreview}
                        alt={r.fileName}
                        className="w-10 h-7 object-cover rounded border border-border"
                      />
                      <span className="text-sm font-medium max-w-[120px] truncate">
                        {r.fileName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {r.regulation ? (
                      <Badge variant="outline" className="font-mono">
                        {r.regulation}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {r.ocrData ? (
                      <div className="flex flex-wrap gap-1">
                        {r.ocrData.regulation === "A3" &&
                          r.ocrData.questions.map((q, qi) => (
                            <span
                              key={qi}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-mono"
                            >
                              Q{q.q}: {q.a}+{q.b}+{q.c}={q.total}
                            </span>
                          ))}
                        {r.ocrData.regulation === "R23" && (
                          <>
                            <span className="text-xs font-semibold text-muted-foreground mr-1">A:</span>
                            {r.ocrData.partA.map((q, qi) => (
                              <span
                                key={`a${qi}`}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-mono"
                              >
                                Q{q.q}: {q.marks}
                              </span>
                            ))}
                            <span className="text-xs font-semibold text-muted-foreground ml-2 mr-1">B:</span>
                            {r.ocrData.partB.map((q, qi) => (
                              <span
                                key={`b${qi}`}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-mono"
                              >
                                Q{q.q}: {q.i}+{q.ii}+{q.iii}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {r.calculatedTotal}
                    {r.regulation === "R23" && r.partATotal !== undefined && (
                      <span className="block text-xs text-muted-foreground font-normal">
                        A:{r.partATotal} + B:{r.partBTotal}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.writtenTotal ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.bubbleTotal ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.status === "PASSED" ? (
                      <Badge className="bg-success text-success-foreground gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        PASSED
                      </Badge>
                    ) : r.status === "FAILED" ? (
                      <Badge className="bg-destructive text-destructive-foreground gap-1">
                        <XCircle className="w-3 h-3" />
                        FAILED
                      </Badge>
                    ) : (
                      <Badge className="bg-warning text-warning-foreground gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        ERROR
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground max-w-[250px]">
                      {r.remarks}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
