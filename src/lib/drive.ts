import { google } from "googleapis";
import { DriveRawFile, DriveFolderItem } from "@/types";
import { formatBytes, formatDate } from "./utils";

/**
 * Fetches folders inside a specific parent folder in Google Drive (defaults to 'root')
 */
export async function fetchGoogleDriveFolders(
  accessToken: string,
  parentId: string = "root"
): Promise<DriveFolderItem[]> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: "v3", auth });

    const safeParent = parentId.trim().replace(/[^a-zA-Z0-9_-]/g, "") || "root";
    const query = `mimeType = 'application/vnd.google-apps.folder' and trashed = false and '${safeParent}' in parents`;

    const response = await drive.files.list({
      q: query,
      pageSize: 100,
      orderBy: "name asc",
      fields: "files(id, name, modifiedTime, parents)",
    });

    const folders = response.data.files || [];

    return folders.map((f) => ({
      id: f.id || "",
      name: f.name || "Carpeta sin nombre",
      modifiedTime: f.modifiedTime || undefined,
      modifiedTimeFormatted: f.modifiedTime ? formatDate(f.modifiedTime) : undefined,
      parents: f.parents || [],
    }));
  } catch (error) {
    console.error("Error al listar carpetas de Google Drive:", error);
    throw error;
  }
}

/**
 * Fetches metadata of a specific folder (for breadcrumbs and session naming)
 */
export async function fetchFolderDetails(
  accessToken: string,
  folderId: string
): Promise<DriveFolderItem | null> {
  if (!folderId || folderId === "root" || folderId === "all") {
    return {
      id: "root",
      name: "Mi Unidad (Raíz)",
    };
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: "v3", auth });

    const safeFolderId = folderId.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    const response = await drive.files.get({
      fileId: safeFolderId,
      fields: "id, name, modifiedTime, parents",
    });

    return {
      id: response.data.id || safeFolderId,
      name: response.data.name || "Carpeta",
      modifiedTime: response.data.modifiedTime || undefined,
      modifiedTimeFormatted: response.data.modifiedTime
        ? formatDate(response.data.modifiedTime)
        : undefined,
      parents: response.data.parents || [],
    };
  } catch (err) {
    console.warn(`No se pudo obtener detalle de carpeta ${folderId}:`, err);
    return { id: folderId, name: `Carpeta (${folderId.slice(0, 8)}...)` };
  }
}

/**
 * Fetches files from Google Drive with PAGINATION, MULTI-FOLDER SUPPORT,
 * and support for ALL file types (RAW, JPG, PNG, WEBP, videos, documents, etc.).
 * Accepts single folderId or array of folderIds to merge and cache multiple folders together!
 */
export async function fetchGoogleDriveRawFiles(
  accessToken: string,
  folderIds?: string | string[],
  maxFiles: number = 5000,
  fileTypeFilter: "all" | "images" | "raw" = "all"
): Promise<DriveRawFile[]> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: "v3", auth });

    // Normalize folderIds into array of sanitized IDs
    const idList: string[] = Array.isArray(folderIds)
      ? folderIds
      : folderIds
      ? [folderIds]
      : [];

    const validFolderIds = idList
      .map((id) => id.trim().replace(/[^a-zA-Z0-9_-]/g, ""))
      .filter((id) => id !== "" && id !== "all" && id !== "root");

    // Base query: exclude trashed files and Google Drive folder objects
    let query = "trashed = false and mimeType != 'application/vnd.google-apps.folder'";

    if (fileTypeFilter === "raw") {
      query +=
        " and (name contains '.NEF' or name contains '.nef' or name contains '.CR2' or name contains '.cr2' or name contains '.CR3' or name contains '.cr3' or name contains '.ARW' or name contains '.arw' or name contains '.DNG' or name contains '.dng' or mimeType = 'image/x-nikon-nef')";
    } else if (fileTypeFilter === "images") {
      query +=
        " and (mimeType contains 'image/' or name contains '.NEF' or name contains '.nef' or name contains '.CR2' or name contains '.cr2' or name contains '.ARW' or name contains '.arw' or name contains '.DNG' or name contains '.dng' or name contains '.jpg' or name contains '.jpeg' or name contains '.png' or name contains '.webp')";
    }

    if (validFolderIds.length === 1) {
      query += ` and '${validFolderIds[0]}' in parents`;
    } else if (validFolderIds.length > 1) {
      // Multi-folder query: ('id1' in parents or 'id2' in parents or ...)
      const parentClauses = validFolderIds.map((id) => `'${id}' in parents`).join(" or ");
      query += ` and (${parentClauses})`;
    }

    const allDriveFiles: Array<{
      id?: string | null;
      name?: string | null;
      mimeType?: string | null;
      size?: string | null;
      modifiedTime?: string | null;
      thumbnailLink?: string | null;
      iconLink?: string | null;
      webContentLink?: string | null;
      parents?: string[] | null;
      imageMediaMetadata?: Record<string, unknown> | null;
    }> = [];

    let pageToken: string | undefined = undefined;
    let hasNextPage = true;

    // Paginate through Google Drive API to fetch ALL matching files without 100 limit
    while (hasNextPage && allDriveFiles.length < maxFiles) {
      const listParams: {
        q: string;
        pageSize: number;
        pageToken?: string;
        orderBy: string;
        fields: string;
      } = {
        q: query,
        pageSize: 100,
        orderBy: "modifiedTime desc",
        fields:
          "nextPageToken, files(id, name, mimeType, size, modifiedTime, thumbnailLink, iconLink, webContentLink, parents, imageMediaMetadata)",
      };

      if (pageToken) {
        listParams.pageToken = pageToken;
      }

      const res = await drive.files.list(listParams);
      const pageFiles = res.data.files || [];
      allDriveFiles.push(...pageFiles);

      if (res.data.nextPageToken) {
        pageToken = res.data.nextPageToken;
      } else {
        hasNextPage = false;
      }
    }

    const rawExtensions = new Set([
      "NEF",
      "NRW",
      "CR2",
      "CR3",
      "ARW",
      "DNG",
      "RAF",
      "ORF",
      "RW2",
      "PEF",
      "SRW",
    ]);

    const imageExtensions = new Set([
      "JPG",
      "JPEG",
      "PNG",
      "WEBP",
      "GIF",
      "TIFF",
      "TIF",
      "HEIC",
      "HEIF",
      "BMP",
      "AVIF",
      "SVG",
    ]);

    const videoExtensions = new Set([
      "MP4",
      "MOV",
      "AVI",
      "MKV",
      "M4V",
      "WEBM",
    ]);

    const docExtensions = new Set([
      "PDF",
      "DOC",
      "DOCX",
      "XLS",
      "XLSX",
      "PPT",
      "PPTX",
      "TXT",
      "XMP",
      "ZIP",
      "RAR",
      "7Z",
    ]);

    return allDriveFiles.map((file) => {
      const sizeBytes = parseInt(file.size || "0", 10);
      const rawName = file.name || "Archivo_Sin_Nombre";
      
      // Determine file extension
      const rawExt = rawName.includes(".")
        ? rawName.split(".").pop()?.toUpperCase() || ""
        : "";
      const extension = rawExt || "ARCHIVO";

      // Classify file category
      let category: "raw" | "image" | "video" | "document" | "other" = "other";
      if (rawExtensions.has(extension) || file.mimeType === "image/x-nikon-nef") {
        category = "raw";
      } else if (
        imageExtensions.has(extension) ||
        (file.mimeType && file.mimeType.startsWith("image/"))
      ) {
        category = "image";
      } else if (
        videoExtensions.has(extension) ||
        (file.mimeType && file.mimeType.startsWith("video/"))
      ) {
        category = "video";
      } else if (docExtensions.has(extension)) {
        category = "document";
      }

      const isNef = extension === "NEF" || file.mimeType === "image/x-nikon-nef";

      // Enhance thumbnail quality from Google (scaling thumbnail up to 800px)
      let thumb = file.thumbnailLink || null;
      if (thumb && thumb.includes("=s")) {
        thumb = thumb.replace(/=s\d+/, "=s800");
      }

      const meta = file.imageMediaMetadata as Record<string, unknown> | undefined;

      const parentInfo =
        file.parents && file.parents.length > 0 ? `Carpeta: ${file.parents[0]}` : "Google Drive";

      return {
        id: file.id || "",
        name: rawName,
        mimeType: file.mimeType || "application/octet-stream",
        size: sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        modifiedTime: file.modifiedTime || new Date().toISOString(),
        modifiedTimeFormatted: formatDate(file.modifiedTime || new Date().toISOString()),
        thumbnailLink: thumb,
        iconLink: file.iconLink || undefined,
        webContentLink: file.webContentLink || undefined,
        folderPath: validFolderIds.length > 1 ? `Lote Multi-Carpeta (${parentInfo})` : `/Google Drive/${parentInfo}`,
        folderId: file.parents?.[0] || undefined,
        cameraModel: typeof meta?.cameraModel === "string" ? meta.cameraModel : undefined,
        iso: typeof meta?.isoSpeed === "number" ? meta.isoSpeed : undefined,
        shutterSpeed: typeof meta?.exposureTime === "string" ? meta.exposureTime : undefined,
        aperture: typeof meta?.aperture === "number" ? `f/${meta.aperture}` : undefined,
        isNef,
        extension,
        category,
      };
    });
  } catch (error) {
    console.error("Error al consultar Google Drive API:", error);
    throw error;
  }
}
