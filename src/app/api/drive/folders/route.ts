import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchGoogleDriveFolders, fetchFolderDetails } from "@/lib/drive";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión con tu cuenta de Google." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId") || "root";

    const [folders, currentFolder] = await Promise.all([
      fetchGoogleDriveFolders(session.accessToken, parentId),
      parentId !== "root" ? fetchFolderDetails(session.accessToken, parentId) : null,
    ]);

    return NextResponse.json({
      folders,
      parentId,
      currentFolder: currentFolder || { id: "root", name: "Mi Unidad (Raíz)" },
      totalFolders: folders.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error al obtener carpetas de Google Drive";
    console.error("API /api/drive/folders error:", error);
    return NextResponse.json({ error: msg, folders: [] }, { status: 500 });
  }
}
