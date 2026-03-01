'use client';

import { useState } from 'react';
import { Camera, Video, MapPin, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui';
import type { MediaAttachment, GeoLocation } from '@/types';
import { getCurrentLocation } from '@/lib/geolocation';
import { v4 as uuidv4 } from 'uuid';

interface MediaCaptureProps {
  onCapture: (media: MediaAttachment) => void;
  maxItems?: number;
  currentCount?: number;
}

export default function MediaCapture({ onCapture, maxItems = 5, currentCount = 0 }: MediaCaptureProps) {
  const [capturing, setCapturing] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'getting' | 'done' | 'error'>('idle');
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canCapture = currentCount < maxItems;

  const getLocation = async () => {
    setLocationStatus('getting');
    setError(null);
    try {
      const loc = await getCurrentLocation();
      setCurrentLocation(loc);
      setLocationStatus('done');
      return loc;
    } catch (err) {
      setLocationStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to get location');
      return null;
    }
  };

  const handleCapture = async (type: 'image' | 'video') => {
    if (!canCapture) return;
    setCapturing(true);
    setError(null);

    try {
      // Get location first
      const location = currentLocation || await getLocation();
      if (!location) {
        setError('Location is required for geotagged media. Please enable location access.');
        setCapturing(false);
        return;
      }

      // Open file picker with camera
      const file = await openFileCapture(type);
      if (!file) {
        setCapturing(false);
        return;
      }

      const uri = URL.createObjectURL(file);
      const deviceInfo = `${navigator.platform} | ${window.screen.width}x${window.screen.height}`;

      const attachment: MediaAttachment = {
        id: uuidv4(),
        type,
        uri,
        geoLocation: location,
        capturedAt: new Date().toISOString(),
        deviceInfo,
        syncStatus: 'pending',
      };

      onCapture(attachment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to capture media');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Geotagged Evidence <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-gray-500">{currentCount}/{maxItems} media</span>
      </div>

      {/* Location Status */}
      <div className="flex items-center gap-2 text-xs">
        {locationStatus === 'idle' && (
          <button
            onClick={getLocation}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            <MapPin size={12} />
            Get Current Location
          </button>
        )}
        {locationStatus === 'getting' && (
          <span className="flex items-center gap-1 text-amber-600">
            <span className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            Getting location...
          </span>
        )}
        {locationStatus === 'done' && currentLocation && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle size={12} />
            Location locked: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </span>
        )}
        {locationStatus === 'error' && (
          <span className="flex items-center gap-1 text-red-600">
            <AlertCircle size={12} />
            Location error — tap to retry
          </span>
        )}
      </div>

      {/* Capture Buttons */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<Camera size={16} />}
          onClick={() => handleCapture('image')}
          disabled={!canCapture || capturing}
          loading={capturing}
        >
          Take Photo
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<Video size={16} />}
          onClick={() => handleCapture('video')}
          disabled={!canCapture || capturing}
        >
          Record Video
        </Button>
      </div>

      {/* Info Notice */}
      <p className="text-xs text-gray-500 flex items-start gap-1">
        <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
        Photos and videos must be captured on-site with location enabled. Gallery uploads without GPS metadata are not accepted.
      </p>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2 flex items-start gap-1">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}
    </div>
  );
}

function openFileCapture(type: 'image' | 'video'): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 'video/*';
    input.capture = 'environment';
    input.onchange = () => resolve(input.files?.[0] || null);
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}

// ==================== MEDIA PREVIEW GALLERY ====================
interface MediaPreviewProps {
  media: MediaAttachment[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}

export function MediaPreview({ media, onRemove, readOnly = false }: MediaPreviewProps) {
  if (media.length === 0) return null;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {media.map((item) => (
        <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
          {item.type === 'image' ? (
            <img src={item.uri} alt="Evidence" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <Video size={24} className="text-white" />
            </div>
          )}
          
          {/* Geo badge */}
          <div className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded">
            <MapPin size={8} />
            {item.geoLocation.latitude.toFixed(3)}, {item.geoLocation.longitude.toFixed(3)}
          </div>

          {/* Remove button */}
          {!readOnly && onRemove && (
            <button
              onClick={() => onRemove(item.id)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
