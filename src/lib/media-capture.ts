import type { MediaAttachment, GeoLocation } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentLocation } from './geolocation';

/**
 * Capture a photo using the device camera with geolocation metadata.
 * Uses the native file input with camera capture for maximum compatibility.
 */
export async function captureGeotaggedPhoto(): Promise<MediaAttachment | null> {
  try {
    // Get location first to ensure we have it
    const location = await getCurrentLocation();
    
    // Create a file input to trigger camera
    const file = await openCameraCapture('image');
    if (!file) return null;

    const uri = URL.createObjectURL(file);
    const deviceInfo = getDeviceInfo();

    const attachment: MediaAttachment = {
      id: uuidv4(),
      type: 'image',
      uri,
      geoLocation: location,
      capturedAt: new Date().toISOString(),
      deviceInfo,
      syncStatus: 'pending',
    };

    return attachment;
  } catch (error) {
    console.error('Failed to capture geotagged photo:', error);
    throw error;
  }
}

/**
 * Capture a video with geolocation metadata.
 */
export async function captureGeotaggedVideo(): Promise<MediaAttachment | null> {
  try {
    const location = await getCurrentLocation();
    const file = await openCameraCapture('video');
    if (!file) return null;

    const uri = URL.createObjectURL(file);
    const deviceInfo = getDeviceInfo();

    const attachment: MediaAttachment = {
      id: uuidv4(),
      type: 'video',
      uri,
      geoLocation: location,
      capturedAt: new Date().toISOString(),
      deviceInfo,
      syncStatus: 'pending',
    };

    return attachment;
  } catch (error) {
    console.error('Failed to capture geotagged video:', error);
    throw error;
  }
}

/**
 * Validate that an uploaded file has valid location metadata.
 * For gallery uploads, we check EXIF data for GPS coordinates.
 */
export function validateLocationMetadata(file: File): Promise<GeoLocation | null> {
  return new Promise((resolve) => {
    // For prototype, we check if the file is an image and try to extract EXIF
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    // Simple EXIF GPS extraction (basic implementation)
    const reader = new FileReader();
    reader.onload = () => {
      // In a production app, we'd use a proper EXIF parser library
      // For the prototype, we return null to enforce camera-only capture
      resolve(null);
    };
    reader.readAsArrayBuffer(file.slice(0, 128 * 1024)); // Read first 128KB for EXIF
  });
}

/**
 * Open the device camera for capture.
 */
function openCameraCapture(type: 'image' | 'video'): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 'video/*';
    input.capture = 'environment'; // Use rear camera by default

    input.onchange = () => {
      const file = input.files?.[0] || null;
      resolve(file);
    };

    // Handle cancel
    input.addEventListener('cancel', () => resolve(null));
    
    // Trigger file picker
    input.click();
  });
}

/**
 * Get device information for fraud prevention metadata.
 */
function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform || 'Unknown';
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  return `${platform} | ${screenSize} | ${ua.substring(0, 100)}`;
}

/**
 * Compress an image for storage/upload efficiency.
 */
export async function compressImage(
  blob: Blob,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Failed to compress image'));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Generate a thumbnail from an image blob.
 */
export async function generateThumbnail(blob: Blob, size: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Center-crop
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => reject(new Error('Failed to generate thumbnail'));
    img.src = URL.createObjectURL(blob);
  });
}
