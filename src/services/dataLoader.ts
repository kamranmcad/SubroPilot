/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';

export interface KBData {
  definitions: Record<string, string>;
  data: any[];
}

/**
 * Loads and parses the claims Excel file from the public directory.
 * 
 * Expectations:
 * - Row 1: Definitions (e.g. "Unique ID for claim")
 * - Row 2: Column Names (e.g. "claimId")
 * - Row 3+: Data rows
 */
export async function loadExcelKnowledgeBase(filePath: string = '/claims_kb.csv'): Promise<KBData> {
  try {
    const cacheBuster = `?t=${Date.now()}`;
    const fullPath = filePath.includes('?') ? filePath : `${filePath}${cacheBuster}`;
    
    console.log(`Fetching latest knowledge base from: ${fullPath}`);
    const response = await fetch(fullPath, { cache: 'no-store' });
    
    // Check if the file exists
    if (!response.ok) {
      // Try again without leading slash if it fails
      if (filePath.startsWith('/')) {
        return loadExcelKnowledgeBase(filePath.substring(1));
      }
      throw new Error(`Knowledge base file "${filePath}" not found (Status: ${response.status}).`);
    }

    // Verify it's not returning HTML (SPA fallback)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
       // If we got HTML at root, maybe it's the wrong path
       if (filePath === '/claims_kb.csv') {
         console.warn("Got HTML at /claims_kb.csv, trying claims_kb.csv");
         return loadExcelKnowledgeBase('claims_kb.csv');
       }
      throw new Error(`Expected Knowledge Base file (XLSX/CSV) but received HTML content from ${filePath}. This usually means the file is missing from the public folder.`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Parse as raw 2D array to handle the specific Row 1, 2, 3 logic
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length < 3) {
      throw new Error("Excel file must have at least 3 rows (Definitions, Headers, and Data).");
    }

    const row1_definitions = rawData[0] || [];
    const row2_headers = (rawData[1] || []).map(h => String(h || '').trim());
    const row3_onwards_data = rawData.slice(2);

    const definitions: Record<string, string> = {};
    row2_headers.forEach((header, index) => {
      if (header) {
        definitions[header] = String(row1_definitions[index] || "No definition provided.").trim();
      }
    });

    const data = row3_onwards_data.map(row => {
      const record: any = {};
      row2_headers.forEach((header, index) => {
        if (header) {
          // Use null for empty values so JSON.stringify includes the key
          const val = row[index];
          record[header] = (val === undefined || val === null || val === '') ? null : val;
        }
      });
      return record;
    });

    console.log(`Successfully indexed ${data.length} records with ${Object.keys(definitions).length} fields.`);
    if (data.length > 0) {
      console.log("First record sample:", data[0]);
    }

    return { definitions, data };
  } catch (error) {
    console.error("Error loading Excel Knowledge Base:", error);
    throw error;
  }
}
