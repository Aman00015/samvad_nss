'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Complaint } from '@/types';
import { STATUS_CONFIG, CATEGORY_CONFIG } from '@/lib/constants';

// Dynamically import Leaflet components (client-only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface ComplaintMapProps {
  complaints: Complaint[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export default function ComplaintMap({
  complaints,
  height = '400px',
  center = [19.45, 72.82], // MMR center
  zoom = 10,
}: ComplaintMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm"
        style={{ height }}
      >
        Loading map...
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map((complaint) => {
          const statusConfig = STATUS_CONFIG[complaint.status];
          const categoryConfig = CATEGORY_CONFIG[complaint.category];

          return (
            <CircleMarker
              key={complaint.id}
              center={[complaint.geoLocation.latitude, complaint.geoLocation.longitude]}
              radius={8}
              pathOptions={{
                color: statusConfig.color,
                fillColor: categoryConfig.color,
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <p className="text-xs text-gray-500 font-mono">{complaint.ticketNumber}</p>
                  <h4 className="font-semibold text-sm text-gray-900 mt-1">{complaint.title}</h4>
                  <div className="flex gap-2 mt-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                    <span className="text-xs text-gray-500">{categoryConfig.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{complaint.area}, {complaint.ward}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
