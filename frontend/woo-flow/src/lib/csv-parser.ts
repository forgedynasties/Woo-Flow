import Papa from 'papaparse';

export interface ParsedCsvRow {
  [key: string]: string | number | boolean | null;
}

export async function parseCsvFile(file: File): Promise<ParsedCsvRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<ParsedCsvRow>(file as any, {
      header: true, // First row is headers
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically convert strings to numbers/booleans
      complete: (results: Papa.ParseResult<ParsedCsvRow>) => {
        if (results.errors && results.errors.length > 0) {
          const errorMessage = results.errors.map(e => e.message).join(', ');
          console.error('CSV parsing errors:', results.errors);
          // If we have data despite errors, we'll still resolve with data
          if (results.data && results.data.length > 0) {
            resolve(results.data);
          } else {
            reject(new Error(`Failed to parse CSV: ${errorMessage}`));
          }
        } else {
          resolve(results.data);
        }
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
}

// Helper function to validate if CSV has required columns
export function validateCsvColumns(data: ParsedCsvRow[]): { isValid: boolean; missing: string[] } {
  if (!data || data.length === 0) {
    return { isValid: false, missing: ['No data found'] };
  }
  
  // Get column headers from first row
  const headers = Object.keys(data[0]);
  
  // Required columns based on backend expectations
  const requiredColumns = ['type', 'name'];
  const missing = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    isValid: missing.length === 0,
    missing
  };
}
