
import { Guest, EventItem, SheetData } from "./types";

const GUEST_SPREADSHEET_ID = '1baaddDWWEkRsQdFoXwVrLsQKXlc_tlKV7dn0Mu6laTQ';
const GUEST_GID = '444996908';
const GUEST_CSV_URL = `https://docs.google.com/spreadsheets/d/${GUEST_SPREADSHEET_ID}/export?format=csv&gid=${GUEST_GID}`;

const EVENT_SPREADSHEET_ID = '1OTmOBctMR5deE1xiZoAeay6VlmzdhhDKtTU9_zIfdbE';
const EVENT_GID = '1065152523';
const EVENT_CSV_URL = `https://docs.google.com/spreadsheets/d/${EVENT_SPREADSHEET_ID}/export?format=csv&gid=${EVENT_GID}`;

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
    const [guestResponse, eventResponse] = await Promise.all([
      fetch(GUEST_CSV_URL),
      fetch(EVENT_CSV_URL)
    ]);

    if (!guestResponse.ok || !eventResponse.ok) throw new Error("無法讀取試算表內容");

    const [guestContent, eventContent] = await Promise.all([
      guestResponse.text(),
      eventResponse.text()
    ]);

    const guestRows = parseCSV(guestContent);
    const eventRows = parseCSV(eventContent);
    
    // 解析賓客資料
    const guests: Guest[] = guestRows.slice(1).map(row => ({
      tableCode: row[0] || "",
      tableName: row[1] || "",
      tableInsight: row[2] || "",
      name: row[3] || "",
      gender: row[4] || "",
      igId: (row[5] || "").toLowerCase().replace('@', '').trim(),
      sharing: row[6] || "",
      brainstorming: row[7] || "",
      quirky: row[8] || ""
    })).filter(g => g.igId !== "");

    // 解析活動資料
    const events: EventItem[] = eventRows.slice(1).map(row => ({
      time: row[0] || "",
      organizer: row[1] || "",
      title: row[2] || "",
      location: row[3] || "",
      content: row[4] || "",
      limit: row[5] || "",
      formLink: row[6] || "",
      deadline: row[7] || "",
      currentParticipants: row[8] || ""
    })).filter(e => e.title !== "");

    return { guests, events };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { guests: [], events: [] };
  }
};
