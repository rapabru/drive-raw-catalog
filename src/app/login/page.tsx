"use client";

import React, { useEffect } from "react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Camera, ShieldCheck, HardDrive, Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  // If already authenticated, redirect directly to gallery
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-dark-950 text-zinc-100 overflow-hidden px-4 py-12 selection:bg-nikon-amber selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-zinc-800/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main card */}
      <div className="w-full max-w-md bg-dark-900/95 border border-dark-700/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-700 border border-dark-600/60 shadow-inner mb-4 group">
            <Camera className="w-8 h-8 text-nikon-yellow transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-black bg-nikon-yellow rounded shadow">
              .NEF
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Drive RAW Catalog
          </h1>
          <p className="text-sm text-zinc-400">
            Catálogo y Mapeador de archivos RAW Nikon en Google Drive
          </p>
        </div>

        {/* Real Google OAuth Login Button */}
        <div className="space-y-4 mb-8">
          <GoogleSignInButton callbackUrl="/" />
        </div>

        {/* Feature bullets */}
        <div className="space-y-3 pt-6 border-t border-dark-800 text-xs text-zinc-400">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-200">Acceso Seguro de Solo Lectura:</strong> Tu cuenta se autentica directamente con los servidores de Google OAuth para consultar tus archivos de Drive.
            </span>
          </div>

          <div className="flex items-start gap-3">
            <Eye className="w-4 h-4 text-nikon-amber flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-200">Miniaturas Rápidas:</strong> Visualiza y filtra tus sesiones fotográficas pesadas sin necesidad de descargar gigabytes previamente.
            </span>
          </div>

          <div className="flex items-start gap-3">
            <HardDrive className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-200">Descarga Selectiva a Windows:</strong> Selecciona únicamente las tomas que necesitas y envíalas directamente a tu disco local.
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-zinc-600">
        Drive RAW Catalog &bull; Desarrollado para fotógrafos &bull; Next.js 14 & Vercel
      </footer>
    </div>
  );
}
