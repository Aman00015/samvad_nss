'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useComplaintStore } from '@/lib/complaint-store';
import { useConnectivityStore } from '@/lib/sync';
import { PageHeader, Button, Input, Textarea, Select } from '@/components/ui';
import MediaCapture, { MediaPreview } from '@/components/MediaCapture';
import { CATEGORY_CONFIG, MMR_WARDS, MMR_AREAS } from '@/lib/constants';
import { getCurrentLocation } from '@/lib/geolocation';
import type { MediaAttachment, ComplaintCategory, GeoLocation } from '@/types';
import { ArrowLeft, MapPin, Send, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function NewComplaint() {
  const { user } = useAuthStore();
  const { addComplaint } = useComplaintStore();
  const { isOnline } = useConnectivityStore();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [ward, setWard] = useState<string>('');
  const [address, setAddress] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = Object.entries(CATEGORY_CONFIG).map(([val, cfg]) => ({ value: val, label: cfg.label }));
  const areaOptions = MMR_AREAS.map((a) => ({ value: a, label: a }));
  const wardOptions = MMR_WARDS.map((w) => ({ value: w, label: w }));

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleMediaCapture = (attachment: MediaAttachment) => {
    setMedia((prev) => [...prev, attachment]);
    // Also set location from media if not already set
    if (!location) {
      setLocation(attachment.geoLocation);
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async () => {
    if (!title || !description || !category || !area || !ward || !address) {
      setError('Please fill all required fields');
      return;
    }

    if (!location) {
      setError('Location is required. Please enable GPS.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const slaDays = CATEGORY_CONFIG[category as ComplaintCategory]?.slaDays || 7;
      
      const complaint = addComplaint({
        title,
        description,
        category: category as ComplaintCategory,
        status: 'pending',
        priority: 'medium',
        ward,
        city: 'Mumbai Metropolitan Region',
        area,
        address,
        geoLocation: location,
        media,
        citizenId: user?.id || '',
        citizenName: user?.name || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaDays,
        isOverdue: false,
        followUps: [],
        syncStatus: isOnline ? 'synced' : 'pending',
        offlineCreated: !isOnline,
      });

      router.push('/citizen/complaints');
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link href="/citizen" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <PageHeader
        title="File a New Complaint"
        subtitle="Report a civic issue in your area with geotagged evidence"
      />

      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 mb-6">
          <WifiOff size={18} className="text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">You are offline</p>
            <p className="text-xs text-amber-600">Your complaint will be saved locally and synced when you&apos;re back online.</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
          {/* Issue Details */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Issue Details</h2>
            <Input
              label="Title"
              placeholder="Brief description of the issue (e.g., 'Overflowing garbage bins at market')"
              value={title}
              onChange={setTitle}
              required
            />
            <Textarea
              label="Description"
              placeholder="Provide detailed information about the civic issue. Include what you see, how long it has been, and how it affects residents..."
              value={description}
              onChange={setDescription}
              required
              rows={4}
            />
            <Select
              label="Category"
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              placeholder="Select issue category"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Location</h2>
            
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                icon={<MapPin size={14} />}
                onClick={handleGetLocation}
                loading={gettingLocation}
              >
                {location ? 'Update Location' : 'Get My Location'}
              </Button>
              {location && (
                <span className="text-xs text-green-600">
                  ✓ {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Area"
                value={area}
                onChange={setArea}
                options={areaOptions}
                placeholder="Select area"
                required
              />
              <Select
                label="Ward"
                value={ward}
                onChange={setWard}
                options={wardOptions}
                placeholder="Select ward"
                required
              />
            </div>
            <Input
              label="Address / Landmark"
              placeholder="Specific address or nearby landmark"
              value={address}
              onChange={setAddress}
              required
              icon={<MapPin size={14} />}
            />
          </div>

          {/* Media Capture */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h2 className="text-base font-semibold text-gray-900">Photo / Video Evidence</h2>
            <MediaCapture
              onCapture={handleMediaCapture}
              maxItems={5}
              currentCount={media.length}
            />
            <MediaPreview media={media} onRemove={handleRemoveMedia} />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100">
            <Button
              fullWidth
              size="lg"
              icon={<Send size={18} />}
              onClick={handleSubmit}
              loading={submitting}
              disabled={!title || !description || !category || !area || !ward || !address}
            >
              Submit Complaint
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
