import { google } from "googleapis";
import { DriveRawFile } from "@/types";
import { formatBytes, formatDate } from "./utils";

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

    // Build search query strictly for Nikon RAW (.NEF) files
    let query =
      "trashed = false and (name contains '.NEF' or name contains '.nef' or mimeType = 'image/x-nikon-nef')";

    if (folderId && folderId.trim() !== "" && folderId !== "all" && folderId !== "root") {
      // Security: Sanitize folderId against Drive query injection
      const sanitizedFolderId = folderId.trim().replace(/[^a-zA-Z0-9_-]/g, "");
      if (sanitizedFolderId) {
        query += ` and '${sanitizedFolderId}' in parents`;
      }
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

      // Enhance thumbnail quality from Google (scaling thumbnail up to 800px)
      let thumb = file.thumbnailLink || null;
      if (thumb && thumb.includes("=s")) {
        thumb = thumb.replace(/=s\d+/, "=s800");
      }

      const meta = file.imageMediaMetadata as Record<string, unknown> | undefined;

      return {
        id: file.id || "",
        name: file.name || "Archivo_RAW.NEF",
        mimeType: file.mimeType || "image/x-nikon-nef",
        size: sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
        modifiedTime: file.modifiedTime || new Date().toISOString(),
        modifiedTimeFormatted: formatDate(file.modifiedTime || new Date().toISOString()),
        thumbnailLink: thumb,
        webContentLink: file.webContentLink || undefined,
        folderPath: folderId ? `Google Drive (ID: ${folderId})` : "/Google Drive",
        cameraModel: typeof meta?.cameraModel === "string" ? meta.cameraModel : undefined,
        iso: typeof meta?.isoSpeed === "number" ? meta.isoSpeed : undefined,
        shutterSpeed: typeof meta?.exposureTime === "string" ? meta.exposureTime : undefined,
        aperture: typeof meta?.aperture === "number" ? `f/${meta.aperture}` : undefined,
        isNef,
      };
    });
  } catch (error) {
    console.error("Error al consultar Google Drive API:", error);
    throw error;
  }
}
