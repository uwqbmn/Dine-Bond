
import { GoogleGenAI, Type } from "@google/genai";
import { SheetData } from "./types";

export const organizeSheetWithAI = async (csvContent: string): Promise<SheetData | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `以下是來自聚會 Google Sheet 的 CSV 內容。請幫我整理成結構化的 JSON 格式。
      CSV 內容：
      ${csvContent}`,
      config: {
        systemInstruction: `你是一個專業的資料處理助手。你的任務是將 CSV 內容轉換為特定的 JSON 結構。
        
        CSV 欄位順序對應：
        1. 姓名 (Name)
        2. IG ID (Instagram ID)
        3. 桌號 (Table Code)
        4. 桌名 (Table Name)
        5. 分享想法 (Sharing Icebreaker)
        6. 集思廣益 (Brainstorming Icebreaker)
        7. 搞怪話題 (Quirky Icebreaker)
        8. 桌號鍵值 (用於描述對應)
        9. 桌次邏輯說明 (Table Insight)
        10. 標籤 (TITLE/VENUE/TIME/ANNOUNCEMENT)
        11. 標籤內容

        JSON 結構必須包含：
        1. guests: Guest[] (igId, name, tableCode, tableName)
        2. icebreakerSets: IcebreakerSet[] - 請務必讀取每一行中的「分享想法」、「集思廣益」與「搞怪話題」。如果該行有內容，請完整保留。
        3. tableDescriptions: 物件陣列 (tableId, description)
        4. eventInfo: EventInfo (title, venue, time, announcement)
        
        注意：
        - 每個賓客對應一個 IcebreakerSet，請按順序排列，以便程式能正確匹配。
        - 必須確保 icebreakerSets 陣列中的每個物件都包含 sharing, brainstorming, quirky 三個屬性。
        - 清理 igId 為小寫並移除 @。`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            guests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  igId: { type: Type.STRING },
                  name: { type: Type.STRING },
                  tableCode: { type: Type.STRING },
                  tableName: { type: Type.STRING }
                },
                required: ["igId", "name", "tableCode", "tableName"]
              }
            },
            icebreakerSets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sharing: { type: Type.STRING, description: "分享想法話題" },
                  brainstorming: { type: Type.STRING, description: "集思廣益話題" },
                  quirky: { type: Type.STRING, description: "搞怪話題" }
                },
                required: ["sharing", "brainstorming", "quirky"]
              }
            },
            tableDescriptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tableId: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["tableId", "description"]
              }
            },
            eventInfo: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                venue: { type: Type.STRING },
                time: { type: Type.STRING },
                announcement: { type: Type.STRING }
              }
            }
          },
          required: ["guests", "icebreakerSets", "tableDescriptions", "eventInfo"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const rawData = JSON.parse(text);
    
    const formattedTableDescriptions: Record<string, string> = {};
    if (Array.isArray(rawData.tableDescriptions)) {
      rawData.tableDescriptions.forEach((item: { tableId: string; description: string }) => {
        formattedTableDescriptions[item.tableId] = item.description;
      });
    }

    return {
      ...rawData,
      tableDescriptions: formattedTableDescriptions
    } as SheetData;
  } catch (error) {
    console.error("Gemini Organization Error:", error);
    return null;
  }
};
