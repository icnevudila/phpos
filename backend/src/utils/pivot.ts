/**
 * Pivot Utility
 * Helper functions to transform flat SQL result sets into pivoted structures.
 */

export interface PivotOptions<T> {
  data: T[];
  rowKey: keyof T;
  columnKey: keyof T;
  valueKey: keyof T;
  aggregator?: (values: any[]) => any;
}

/**
 * Pivots an array of objects.
 * Example: [{ dentist: "Dr. A", month: "Jan", revenue: 100 }, ...]
 * To: { "Dr. A": { "Jan": 100, "Feb": 200 }, "Dr. B": { ... } }
 */
export function pivotData<T>(options: PivotOptions<T>) {
  const { data, rowKey, columnKey, valueKey, aggregator } = options;
  const result: Record<string, Record<string, any>> = {};
  const columns = new Set<string>();

  data.forEach((item) => {
    const row = String(item[rowKey]);
    const col = String(item[columnKey]);
    const val = item[valueKey];

    columns.add(col);

    if (!result[row]) result[row] = {};
    
    if (aggregator) {
      if (!result[row][col]) result[row][col] = [];
      (result[row][col] as any[]).push(val);
    } else {
      result[row][col] = val;
    }
  });

  if (aggregator) {
    Object.keys(result).forEach((row) => {
      Object.keys(result[row]).forEach((col) => {
        result[row][col] = aggregator(result[row][col]);
      });
    });
  }

  return {
    rows: result,
    columnHeaders: Array.from(columns).sort()
  };
}

/**
 * Generates an XML structure for FastReport from a pivoted dataset.
 */
export function generateFastReportXml(reportName: string, data: any): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<Report name="${reportName}">\n`;
  
  if (Array.isArray(data)) {
    data.forEach((row, idx) => {
      xml += `  <Row id="${idx}">\n`;
      Object.entries(row).forEach(([key, val]) => {
        xml += `    <${key}>${val}</${key}>\n`;
      });
      xml += `  </Row>\n`;
    });
  } else {
    // Nested/Pivoted data
    Object.entries(data).forEach(([rowName, cols]: [string, any]) => {
      xml += `  <Group name="${rowName}">\n`;
      Object.entries(cols).forEach(([colName, val]) => {
        xml += `    <Entry label="${colName}">${val}</Entry>\n`;
      });
      xml += `  </Group>\n`;
    });
  }

  xml += `</Report>`;
  return xml;
}
