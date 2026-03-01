import type { GeoLocation } from '@/types';

/**
 * Get current device geolocation using the browser Geolocation API.
 * Returns a promise that resolves with GeoLocation data.
 */
export function getCurrentLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location access.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out. Please try again.'));
            break;
          default:
            reject(new Error('An unknown error occurred while getting location.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000, // Cache for 1 minute
      }
    );
  });
}

/**
 * Watch position changes continuously.
 * Returns a cleanup function to stop watching.
 */
export function watchLocation(
  onUpdate: (location: GeoLocation) => void,
  onError?: (error: Error) => void
): () => void {
  if (!navigator.geolocation) {
    onError?.(new Error('Geolocation is not supported'));
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      onError?.(new Error(error.message));
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Validate that a GeoLocation is within the Mumbai Metropolitan Region (approximate bounds).
 */
export function isWithinMMR(location: GeoLocation): boolean {
  // Approximate bounding box for MMR
  const MMR_BOUNDS = {
    north: 20.35,
    south: 18.85,
    east: 73.30,
    west: 72.70,
  };

  return (
    location.latitude >= MMR_BOUNDS.south &&
    location.latitude <= MMR_BOUNDS.north &&
    location.longitude >= MMR_BOUNDS.west &&
    location.longitude <= MMR_BOUNDS.east
  );
}

/**
 * Format coordinates for display.
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Get human-readable accuracy description.
 */
export function getAccuracyDescription(meters: number): string {
  if (meters <= 10) return 'Very precise';
  if (meters <= 50) return 'Good';
  if (meters <= 100) return 'Moderate';
  return 'Low accuracy';
}
