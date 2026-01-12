
import { Guest, SheetData } from "./types";

const SPREADSHEET_ID = '1baaddDWWEkRsQdFoXwVrLsQKXlc_tlKV7dn0Mu6laTQ';
const GID = '444996908';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`;

const parseCSV = (text: string): string[][] => {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentToken = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (currentToken || currentRow.length > 0) {
        currentRow.push(currentToken.trim());
        lines.push(currentRow);
      }
      currentToken = '';
      currentRow = [];
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentToken += char;
    }
  }
  if (currentToken || currentRow.length > 0) {
    currentRow.push(currentToken.trim());
    lines.push(currentRow);
  }
  return lines;
};

export const fetchAppDataFromSheet = async (): Promise<SheetData> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error("無法讀取試算表內容");
    const csvContent = await response.text();
    const rows = parseCSV(csvContent);
    
    // 跳過標題列，解析資料列
    const guests: Guest[] = rows.slice(1).map(row => ({
      tableCode: row[0] || "",
      tableName: row[1] || "",
      tableInsight: row[2] || "",
      name: row[3] || "",
      gender: row[4] || "",
      igId: (row[5] || "").toLowerCase().replace('@', '').trim(),
      sharing: row[6] || "",
      brainstorming: row[7] || "",
      quirky: row[8] || ""
    })).filter(g => g.igId !== ""); // 移除空行

    return { guests };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { guests: [] };
  }
};
