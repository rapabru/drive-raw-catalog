export interface DemoFolderInfo {
  id: string;
  name: string;
  path: string;
  count: number;
}

export const MOCK_FOLDERS: DemoFolderInfo[] = [
  { id: "all", name: "Todo Google Drive", path: "/Google Drive/RAWs", count: 12 },
  { id: "studio-portrait", name: "Studio Portrait 2026", path: "/Fotografia/Studio_Portrait_2026/RAW_Session_01", count: 4 },
  { id: "patagonia", name: "Paisajes Patagonia", path: "/Fotografia/Paisajes_Patagonia_2026/Lagos", count: 4 },
  { id: "boda-vip", name: "Bodas & Eventos VIP", path: "/Fotografia/Bodas_Evento_VIP/Ceremonia", count: 4 },
];
