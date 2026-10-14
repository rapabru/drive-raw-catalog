import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const fileName = searchParams.get("fileName") || "raw_file.NEF";

    if (!fileId) {
      return NextResponse.json({ error: "fileId es requerido" }, { status: 400 });
    }

    // If it's a mock file, return a dummy mock response or redirect
    if (fileId.startsWith("nef-mock-")) {
      const mockRawContent = `RAW_DATA_SIMULATION:${fileName}:SIZE=45MB:NIKON_NEF`;
      return new NextResponse(mockRawContent, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    if (!session?.accessToken) {
      return NextResponse.json({ error: "No autorizado o token ausente" }, { status: 401 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    return new NextResponse(response.data as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error al descargar archivo de Google Drive:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido en descarga";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
