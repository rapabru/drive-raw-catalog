export interface DriveRawFile {
  id: string;
  name: string;
  mimeType: string;
  size: number; // in bytes
  sizeFormatted: string; // e.g. "45.8 MB"
  modifiedTime: string;
  modifiedTimeFormatted: string;
  thumbnailLink: string | null;
  webContentLink?: string;
  folderPath: string; // e.g. "/Fotografia/Sesiones_2024/RAW"
  folderId?: string;
  cameraModel?: string; // e.g. "Nikon Z8", "Nikon D850"
  iso?: number;
  shutterSpeed?: string;
  aperture?: string;
  isNef: boolean;
}

export interface DriveFolderItem {
  id: string;
  name: string;
  modifiedTime?: string;
  modifiedTimeFormatted?: string;
  parents?: string[];
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export interface FilterOptions {
  searchQuery: string;
  folderFilter: string;
  sortBy: "name" | "date" | "size";
  sortOrder: "asc" | "desc";
}
