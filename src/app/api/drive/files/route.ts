import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchGoogleDriveRawFiles } from "@/lib/drive";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        {
          error: "No autorizado. Inicia sesión con tu cuenta de Google para acceder a tus archivos de Drive.",
          authenticated: false,
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const folderIdsParam = searchParams.get("folderIds");
    const fileTypeParam = (searchParams.get("fileType") || "all") as "all" | "images" | "raw";

    let targetFolderIds: string[] = [];
    if (folderIdsParam) {
      targetFolderIds = folderIdsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 50); // Security: Clamp to max 50 folders per query to prevent query buffer overflow
    } else if (folderId && folderId !== "all" && folderId !== "root") {
      targetFolderIds = [folderId.trim()];
    }

    const files = await fetchGoogleDriveRawFiles(
      session.accessToken,
      targetFolderIds,
      5000,
      fileTypeParam
    );

    return NextResponse.json({
      files,
      folderIds: targetFolderIds,
      totalCount: files.length,
      authenticated: true,
    });
  } catch (error: unknown) {
    console.error("API /api/drive/files error:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los archivos desde Google Drive. Intenta nuevamente.",
        files: [],
      },
      { status: 500 }
    );
  }
}
