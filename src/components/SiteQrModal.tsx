"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, X, Download, Printer, ShieldCheck } from "lucide-react";
import { Organization } from "@/lib/data/types";
import { SECTORS } from "@/config/sectors";

interface SiteQrModalProps {
  organization: Organization;
  onClose: () => void;
}

export function SiteQrModal({ organization, onClose }: SiteQrModalProps) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const sectorConfig = SECTORS[organization.sector] || SECTORS.construction;

  useEffect(() => {
    // Generate high resolution QR code for site entrance muster board
    const qrPayload = JSON.stringify({
      app: "FairShift",
      orgId: organization.id,
      name: organization.name,
      secret: organization.qrCodeSecret,
      lat: organization.geofenceLat,
      lng: organization.geofenceLng,
      timestamp: new Date().toISOString(),
    });

    QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 2,
      color: {
        dark: "#0d2040",
        light: "#ffffff",
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error("Error creating QR:", err));
  }, [organization]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-sdg-burgundy flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Site Check-In QR Code</h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">
                {organization.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tap-target w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Display */}
        <div className="p-6 text-center space-y-4">
          <div className="inline-block p-3 bg-white border-2 border-slate-200 rounded-3xl shadow-inner">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`FairShift QR for ${organization.name}`}
                className="w-56 h-56 mx-auto rounded-xl"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          <div className="text-left bg-slate-50 p-3 rounded-2xl text-xs space-y-1 text-slate-600 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Muster Board QR</span>
            </div>
            <p><strong>Site:</strong> {organization.name}</p>
            <p><strong>Sector:</strong> {sectorConfig.title}</p>
            <p className="text-[11px] font-mono text-slate-500 truncate">
              <strong>Hash:</strong> {organization.qrCodeSecret}
            </p>
          </div>

          <div className="flex gap-2">
            {dataUrl && (
              <a
                href={dataUrl}
                download={`fairshift-qr-${organization.id}.png`}
                className="flex-1 tap-target bg-slate-900 text-white text-xs font-bold py-3 rounded-2xl hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Save Image</span>
              </a>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="tap-target px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl border border-slate-300 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
