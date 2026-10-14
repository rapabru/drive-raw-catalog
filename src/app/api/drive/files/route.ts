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
    const folderId = searchParams.get("folderId") || undefined;

    const files = await fetchGoogleDriveRawFiles(session.accessToken, folderId);

    return NextResponse.json({
      files,
      folderId: folderId || "root",
      totalCount: files.length,
      authenticated: true,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al consultar Google Drive";
    console.error("API /api/drive/files error:", error);

    return NextResponse.json(
      {
        error: errorMessage,
        files: [],
      },
      { status: 500 }
    );
  }
}
