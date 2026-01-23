
export interface Guest {
  tableCode: string;
  tableName: string;
  tableInsight: string;
  name: string;
  gender: string;
  igId: string;
  sharing: string;
  brainstorming: string;
  quirky: string;
}

export interface EventItem {
  time: string;
  organizer: string;
  title: string;
  location: string;
  content: string;
  limit: string;
  formLink: string;
  deadline: string;
  currentParticipants: string;
}

export interface AppState {
  isCheckingIn: boolean;
  checkedInGuest: Guest | null;
  tableMates: Guest[];
  error: string | null;
}

export interface SheetData {
  guests: Guest[];
  events: EventItem[];
}
