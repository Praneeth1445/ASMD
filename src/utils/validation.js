
export function validateSheet(fileName, ocrData, imagePreview) {
  const regulation = ocrData.regulation;
  const writtenTotal = ocrData.writtenTotal;
  const bubbleTotal = ocrData.bubbleTotal;
  const errors = [];

  let calculatedTotal = 0;
  let partATotal;
  let partBTotal;

  if (regulation === "A3") {
    calculatedTotal = ocrData.questions.reduce((sum, q) => sum + (q.total || 0), 0);
  } else if (regulation === "R23") {
    partATotal = ocrData.partA.reduce((sum, q) => sum + (q.marks || 0), 0);
    partBTotal = ocrData.partB.reduce((sum, q) => sum + (q.i || 0) + (q.ii || 0) + (q.iii || 0), 0);
    calculatedTotal = partATotal + partBTotal;
  }

  if (writtenTotal !== null && calculatedTotal !== writtenTotal) {
    errors.push(`Calculated total (${calculatedTotal}) ≠ Written total (${writtenTotal})`);
  }

  if (bubbleTotal !== null && calculatedTotal !== bubbleTotal) {
    errors.push(`Calculated total (${calculatedTotal}) ≠ Bubble total (${bubbleTotal})`);
  }

  if (writtenTotal !== null && bubbleTotal !== null && writtenTotal !== bubbleTotal) {
    errors.push(`Written total (${writtenTotal}) ≠ Bubble total (${bubbleTotal})`);
  }

  const status = errors.length === 0 ? "PASSED" : "FAILED";
  const remarks = errors.length === 0 ? "All totals match" : errors.join("; ");

  return {
    fileName,
    ocrData,
    regulation,
    calculatedTotal,
    writtenTotal,
    bubbleTotal,
    partATotal,
    partBTotal,
    status,
    remarks,
    imagePreview,
  };
}
