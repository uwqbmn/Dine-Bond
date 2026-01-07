
export interface Guest {
  igId: string;
  name: string;
  tableCode: string;
  tableName: string;
}

export interface IcebreakerSet {
  sharing: string;      // 分享想法
  brainstorming: string; // 集思廣益
  quirky: string;        // 搞怪話題
}

export interface EventInfo {
  title?: string;
  venue?: string;
  time?: string;
  announcement?: string;
}

export interface AppState {
  isCheckingIn: boolean;
  checkedInGuest: Guest | null;
  tableMates: Guest[];
  selectedIcebreakers: IcebreakerSet | null;
  tableInsight: string | null;
  error: string | null;
}

export interface SheetData {
  guests: Guest[];
  icebreakerSets: IcebreakerSet[];
  tableDescriptions: Record<string, string>;
  eventInfo: EventInfo;
}
