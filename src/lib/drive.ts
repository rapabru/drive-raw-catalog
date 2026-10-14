import { google } from "googleapis";
import { DriveRawFile } from "@/types";
import { formatBytes, formatDate } from "./utils";
import { DemoFolderInfo, MOCK_FOLDERS } from "./constants";

export { type DemoFolderInfo, MOCK_FOLDERS };


/**
 * Realistic Mock Nikon .NEF dataset for demonstration or testing
 * before Google Cloud Credentials are set up.
 */
export const MOCK_RAW_FILES: DriveRawFile[] = [
  // Session 1: Studio Portrait (Nikon Z8)
  {
    id: "nef-mock-001",
    name: "DSC_9410.NEF",
    mimeType: "image/x-nikon-nef",
    size: 47820412,
    sizeFormatted: formatBytes(47820412),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 4).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Studio_Portrait_2026/RAW_Session_01",
    folderId: "studio-portrait",
    cameraModel: "Nikon Z8",
    iso: 100,
    shutterSpeed: "1/320s",
    aperture: "f/1.8",
    isNef: true,
  },
  {
    id: "nef-mock-002",
    name: "DSC_9411.NEF",
    mimeType: "image/x-nikon-nef",
    size: 51293840,
    sizeFormatted: formatBytes(51293840),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 5).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Studio_Portrait_2026/RAW_Session_01",
    folderId: "studio-portrait",
    cameraModel: "Nikon Z8",
    iso: 100,
    shutterSpeed: "1/400s",
    aperture: "f/2.0",
    isNef: true,
  },
  {
    id: "nef-mock-003",
    name: "DSC_9412.NEF",
    mimeType: "image/x-nikon-nef",
    size: 49102944,
    sizeFormatted: formatBytes(49102944),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 6).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1502759683299-cdcd6974244f?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Studio_Portrait_2026/RAW_Session_01",
    folderId: "studio-portrait",
    cameraModel: "Nikon Z8",
    iso: 160,
    shutterSpeed: "1/250s",
    aperture: "f/2.8",
    isNef: true,
  },
  {
    id: "nef-mock-004",
    name: "DSC_9414.NEF",
    mimeType: "image/x-nikon-nef",
    size: 48320100,
    sizeFormatted: formatBytes(48320100),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 7).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 7).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Studio_Portrait_2026/RAW_Session_01",
    folderId: "studio-portrait",
    cameraModel: "Nikon Z8",
    iso: 100,
    shutterSpeed: "1/500s",
    aperture: "f/2.2",
    isNef: true,
  },

  // Session 2: Patagonia Landscapes (Nikon D850)
  {
    id: "nef-mock-005",
    name: "DSC_9415.NEF",
    mimeType: "image/x-nikon-nef",
    size: 53940120,
    sizeFormatted: formatBytes(53940120),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 10).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Paisajes_Patagonia_2026/Lagos",
    folderId: "patagonia",
    cameraModel: "Nikon D850",
    iso: 64,
    shutterSpeed: "1/125s",
    aperture: "f/8.0",
    isNef: true,
  },
  {
    id: "nef-mock-006",
    name: "DSC_9418.NEF",
    mimeType: "image/x-nikon-nef",
    size: 52109400,
    sizeFormatted: formatBytes(52109400),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 12).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Paisajes_Patagonia_2026/Lagos",
    folderId: "patagonia",
    cameraModel: "Nikon D850",
    iso: 100,
    shutterSpeed: "1/60s",
    aperture: "f/11",
    isNef: true,
  },
  {
    id: "nef-mock-007",
    name: "DSC_9422.NEF",
    mimeType: "image/x-nikon-nef",
    size: 46200110,
    sizeFormatted: formatBytes(46200110),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 18).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Paisajes_Patagonia_2026/Lagos",
    folderId: "patagonia",
    cameraModel: "Nikon D850",
    iso: 200,
    shutterSpeed: "1/500s",
    aperture: "f/4.0",
    isNef: true,
  },
  {
    id: "nef-mock-008",
    name: "DSC_9425.NEF",
    mimeType: "image/x-nikon-nef",
    size: 55410900,
    sizeFormatted: formatBytes(55410900),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 20).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Paisajes_Patagonia_2026/Lagos",
    folderId: "patagonia",
    cameraModel: "Nikon D850",
    iso: 64,
    shutterSpeed: "1/80s",
    aperture: "f/13",
    isNef: true,
  },

  // Session 3: Bodas & Eventos VIP (Nikon Z9)
  {
    id: "nef-mock-009",
    name: "DSC_9430.NEF",
    mimeType: "image/x-nikon-nef",
    size: 48930210,
    sizeFormatted: formatBytes(48930210),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 24).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Bodas_Evento_VIP/Ceremonia",
    folderId: "boda-vip",
    cameraModel: "Nikon Z9",
    iso: 800,
    shutterSpeed: "1/200s",
    aperture: "f/2.8",
    isNef: true,
  },
  {
    id: "nef-mock-010",
    name: "DSC_9435.NEF",
    mimeType: "image/x-nikon-nef",
    size: 50124800,
    sizeFormatted: formatBytes(50124800),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 26).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 26).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Bodas_Evento_VIP/Ceremonia",
    folderId: "boda-vip",
    cameraModel: "Nikon Z9",
    iso: 1600,
    shutterSpeed: "1/160s",
    aperture: "f/2.0",
    isNef: true,
  },
  {
    id: "nef-mock-011",
    name: "DSC_9440.NEF",
    mimeType: "image/x-nikon-nef",
    size: 54100980,
    sizeFormatted: formatBytes(54100980),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 30).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Bodas_Evento_VIP/Recepcion",
    folderId: "boda-vip",
    cameraModel: "Nikon Z9",
    iso: 3200,
    shutterSpeed: "1/125s",
    aperture: "f/1.4",
    isNef: true,
  },
  {
    id: "nef-mock-012",
    name: "DSC_9445.NEF",
    mimeType: "image/x-nikon-nef",
    size: 51870320,
    sizeFormatted: formatBytes(51870320),
    modifiedTime: new Date(Date.now() - 3600 * 1000 * 32).toISOString(),
    modifiedTimeFormatted: formatDate(new Date(Date.now() - 3600 * 1000 * 32).toISOString()),
    thumbnailLink: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    folderPath: "/Fotografia/Bodas_Evento_VIP/Recepcion",
    folderId: "boda-vip",
    cameraModel: "Nikon Z9",
    iso: 2500,
    shutterSpeed: "1/200s",
    aperture: "f/1.8",
    isNef: true,
  },
];

/**
 * Fetches real RAW .NEF files from Google Drive API using user OAuth Access Token
 */
export async function fetchGoogleDriveRawFiles(
  accessToken: string,
  folderId?: string
): Promise<DriveRawFile[]> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth });

    // Build search query for RAW .NEF files
    let query = "trashed = false and (name contains '.NEF' or name contains '.nef' or mimeType = 'image/x-nikon-nef')";
    
    if (folderId && folderId.trim() !== "" && folderId !== "all" && folderId !== "root") {
      query += ` and '${folderId.trim()}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      pageSize: 100,
      orderBy: "modifiedTime desc",
      fields:
        "files(id, name, mimeType, size, modifiedTime, thumbnailLink, webContentLink, parents, imageMediaMetadata)",
    });

    const files = response.data.files || [];

    return files.map((file) => {
      const sizeBytes = parseInt(file.size || "0", 10);
      const isNef = (file.name || "").toLowerCase().endsWith(".nef");

      // Enhance thumbnail quality if available from Google
      let thumb = file.thumbnailLink || null;
      if (thumb && thumb.includes("=s")) {
        thumb = thumb.replace(/=s\d+/, "=s800");
      }

      const meta = file.imageMediaMetadata as Record<string, unknown> | undefined;

      return {
        id: file.id || "",
        name: file.name || "Archivo_Sin_Nombre.NEF",
        mimeType: file.mimeType || "image/x-nikon-nef",
        size: sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        modifiedTime: file.modifiedTime || new Date().toISOString(),
        modifiedTimeFormatted: formatDate(file.modifiedTime || new Date().toISOString()),
        thumbnailLink: thumb,
        webContentLink: file.webContentLink || undefined,
        folderPath: folderId ? `Google Drive (Folder: ${folderId})` : "/Google Drive/RAWs",
        cameraModel: typeof meta?.cameraModel === "string" ? meta.cameraModel : "Nikon Camera",
        iso: typeof meta?.isoSpeed === "number" ? meta.isoSpeed : undefined,
        shutterSpeed: typeof meta?.exposureTime === "string" ? meta.exposureTime : undefined,
        aperture: typeof meta?.aperture === "number" ? `f/${meta.aperture}` : undefined,
        isNef,
      };
    });
  } catch (error) {
    console.error("Error fetching Google Drive RAW files:", error);
    throw error;
  }
}
