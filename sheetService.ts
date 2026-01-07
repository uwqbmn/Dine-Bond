
import { Guest, IcebreakerSet, SheetData, EventInfo } from "./types";
import { organizeSheetWithAI } from "./geminiService";

const SPREADSHEET_ID = '1baaddDWWEkRsQdFoXwVrLsQKXlc_tlKV7dn0Mu6laTQ';
const GID = '444996908';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`;

const parseCSVManual = (text: string): string[][] => {
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

const manualFallback = (csvContent: string): SheetData => {
  const rows = parseCSVManual(csvContent);
  const guests: Guest[] = [];
  const icebreakerSets: IcebreakerSet[] = [];
  const tableDescriptions: Record<string, string> = {};
  const eventInfo: EventInfo = { title: "Dine & Bond" };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;
    
    // 賓客資訊 (Col 0-3)
    if (row[0] && row[1]) {
      guests.push({
        name: row[0],
        igId: row[1].toLowerCase().replace('@', ''),
        tableCode: row[2] || "N/A",
        tableName: row[3] || "N/A"
      });
    }

    // 話題急救包 (Col 4-6)
    if (row[4] || row[5] || row[6]) {
      icebreakerSets.push({
        sharing: row[4] || "分享一個你今天最開心的事。",
        brainstorming: row[5] || "如果這桌要一起創業，你們會做什麼？",
        quirky: row[6] || "如果你可以變成一種動物，你想當什麼？"
      });
    }

    // 桌次邏輯 (Col 7-8)
    if (row[7] && row[8]) tableDescriptions[row[7]] = row[8];

    // 活動資訊 (Col 9-10)
    if (row[9] && row[10]) {
      const key = row[9].toUpperCase();
      if (key === 'TITLE') eventInfo.title = row[10];
      // 不再手動賦予 venue/time 的預設值
    }
  }

  return { guests, icebreakerSets, tableDescriptions, eventInfo };
};

export const fetchAppDataFromSheet = async (): Promise<SheetData> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error("無法讀取試算表內容");
    const csvContent = await response.text();

    const aiOrganizedData = await organizeSheetWithAI(csvContent);
    if (aiOrganizedData) {
      console.log("Data organized by Gemini Flash");
      return aiOrganizedData;
    }

    console.warn("Gemini organization failed, using manual fallback.");
    return manualFallback(csvContent);

  } catch (error) {
    console.error("Fetch Error:", error);
    return {
      guests: [{ igId: "error", name: "載入失敗", tableCode: "!", tableName: "請重新整理" }],
      icebreakerSets: [],
      tableDescriptions: {},
      eventInfo: { title: "Dine & Bond" }
    };
  }
};
