import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión con Google para descargar archivos." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const rawFileName = searchParams.get("fileName") || "archivo_descargado";
    // Security: Sanitize filename to prevent HTTP Header Injection / Content-Disposition manipulation
    const fileName = rawFileName.replace(/[\r\n"\\/]/g, "").trim() || "archivo_descargado";

    if (!fileId) {
      return NextResponse.json({ error: "fileId es requerido" }, { status: 400 });
    }

    // Security: Validate fileId format (Google Drive IDs are base64/alphanumeric with - and _)
    if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      return NextResponse.json({ error: "ID de archivo no válido" }, { status: 400 });
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
