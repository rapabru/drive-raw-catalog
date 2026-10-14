import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchGoogleDriveRawFiles, MOCK_RAW_FILES, MOCK_FOLDERS } from "@/lib/drive";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId") || undefined;
    const forceDemo = searchParams.get("demo") === "true";

    // If OAuth credentials are not configured or forceDemo is active or no active token
    const hasGoogleCreds =
      Boolean(process.env.GOOGLE_CLIENT_ID) &&
      Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
      process.env.GOOGLE_CLIENT_ID !== "your_google_client_id.apps.googleusercontent.com";

    if (forceDemo || !hasGoogleCreds || !session?.accessToken) {
      let filteredMock = MOCK_RAW_FILES;

      if (folderId && folderId !== "all" && folderId !== "root") {
        filteredMock = MOCK_RAW_FILES.filter(
          (f) =>
            f.folderId === folderId ||
            f.folderPath.toLowerCase().includes(folderId.toLowerCase())
        );
      }

      return NextResponse.json({
        files: filteredMock,
        folders: MOCK_FOLDERS,
        isDemo: true,
        currentFolderId: folderId || "all",
        message: !hasGoogleCreds
          ? "Modo Demostración Activo: Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en Vercel para vincular tu Google Drive en vivo."
          : "Sesión sin token de Drive o Modo Demo solicitado.",
      });
    }

    const files = await fetchGoogleDriveRawFiles(session.accessToken, folderId);

    return NextResponse.json({
      files,
      folders: MOCK_FOLDERS,
      isDemo: false,
      currentFolderId: folderId || "root",
      totalCount: files.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al consultar Google Drive";
    console.error("API /api/drive/files error:", error);

    // Resilient fallback to mock files if Google Drive API fails or token expired, so UI never crashes
    return NextResponse.json(
      {
        files: MOCK_RAW_FILES,
        folders: MOCK_FOLDERS,
        isDemo: true,
        error: errorMessage,
        message: "Ocurrió un error al conectar con Google Drive. Mostrando catálogo de demostración.",
      },
      { status: 200 }
    );
  }
}
