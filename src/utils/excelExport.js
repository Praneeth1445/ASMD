import * as XLSX from "xlsx";

export function exportToExcel(results) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Detailed Results
  const headers = [
    "Image Name", "Regulation", "Marks Detail",
    "Calculated Total", "Written Total", "Bubble Total",
    "Part A Total", "Part B Total", "Status", "Remarks"
  ];

  const rows = results.map(r => {
    let marksDetail = "";
    if (r.ocrData?.regulation === "A3") {
      marksDetail = r.ocrData.questions
        .map(q => `Q${q.q}: ${q.a}+${q.b}+${q.c}=${q.total}`)
        .join(" | ");
    } else if (r.ocrData?.regulation === "R23") {
      const partA = r.ocrData.partA.map(q => `Q${q.q}:${q.marks}`).join(", ");
      const partB = r.ocrData.partB.map(q => `Q${q.q}:${q.i}+${q.ii}+${q.iii}`).join(", ");
      marksDetail = `A[${partA}] B[${partB}]`;
    }

    return [
      r.fileName,
      r.regulation || "—",
      marksDetail,
      r.calculatedTotal,
      r.writtenTotal,
      r.bubbleTotal,
      r.partATotal ?? "",
      r.partBTotal ?? "",
      r.status,
      r.remarks,
    ];
  });

  const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws1["!cols"] = headers.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, ws1, "Results");

  // Sheet 2: Summary
  const passed = results.filter(r => r.status === "PASSED").length;
  const failed = results.filter(r => r.status === "FAILED").length;
  const errored = results.filter(r => r.status === "ERROR").length;
  const a3Count = results.filter(r => r.regulation === "A3").length;
  const r23Count = results.filter(r => r.regulation === "R23").length;

  const summaryData = [
    ["OCR Exam Sheet Validation Summary"],
    [],
    ["Total Sheets Processed", results.length],
    ["A3 Regulation Sheets", a3Count],
    ["R23 Regulation Sheets", r23Count],
    ["Passed", passed],
    ["Failed", failed],
    ["Errors", errored],
    [],
    ["Pass Rate", results.length > 0 ? `${((passed / results.length) * 100).toFixed(1)}%` : "N/A"],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
  ws2["!cols"] = [{ wch: 30 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  XLSX.writeFile(wb, `exam_validation_report_${new Date().toISOString().split("T")[0]}.xlsx`);
}
