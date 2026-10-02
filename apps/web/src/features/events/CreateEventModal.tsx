import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { eventsApi, type CreateEventPayload } from '../../api/events.api';
import type { EventSlot } from '@tebeya/shared';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slot, setSlot] = useState<EventSlot>('dinner');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('23:00');
  const [venueText, setVenueText] = useState('');
  const [venueLat, setVenueLat] = useState<string>('9.9312');
  const [venueLng, setVenueLng] = useState<string>('76.2673');
  const [headcount, setHeadcount] = useState(20);
  const [payPerPerson, setPayPerPerson] = useState(800);
  const [dressCode, setDressCode] = useState('Black formal trousers, White shirt, Black shoes');
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !venueText || !startTime || !endTime) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const latNum = venueLat.trim() ? parseFloat(venueLat) : undefined;
    const lngNum = venueLng.trim() ? parseFloat(venueLng) : undefined;

    const payload: CreateEventPayload = {
      title: title.trim(),
      date,
      slot,
      startTime: startTime.slice(0, 5),
      endTime: endTime.slice(0, 5),
      venue: {
        text: venueText.trim(),
        lat: latNum !== undefined && !isNaN(latNum) ? latNum : undefined,
        lng: lngNum !== undefined && !isNaN(lngNum) ? lngNum : undefined,
      },
      headcount: Math.max(1, Number(headcount) || 1),
      payPerPerson: Math.max(0, Number(payPerPerson) || 0),
      status: publishImmediately ? 'published' : 'draft',
      dressCode: dressCode.trim() || undefined,
      notes: notes.trim() || undefined,
      contactPerson:
        contactName.trim() || contactPhone.trim()
          ? { name: contactName.trim() || undefined, phone: contactPhone.trim() || undefined }
          : undefined,
    };

    try {
      await eventsApi.create(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Catering Shift"
      description="Define venue location, meal slot timings, server headcount, and compensation."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <Input
            label="Event / Venue Title"
            placeholder="e.g. Royal Banquet Hall - Wedding Dinner"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Select
            label="Meal Slot"
            value={slot}
            onChange={(e) => setSlot(e.target.value as EventSlot)}
            options={[
              { label: 'Dinner', value: 'dinner' },
              { label: 'Lunch', value: 'lunch' },
              { label: 'Breakfast', value: 'breakfast' },
              { label: 'Snacks / High Tea', value: 'snacks' },
              { label: 'Custom', value: 'custom' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Time (24h)"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="End Time (24h)"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Venue Address & Area"
            placeholder="e.g. Grand Hyatt, Bolgatty, Kochi"
            required
            value={venueText}
            onChange={(e) => setVenueText(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Latitude (for travel distance)"
            type="number"
            step="any"
            placeholder="9.9312"
            value={venueLat}
            onChange={(e) => setVenueLat(e.target.value)}
          />
          <Input
            label="Longitude (for travel distance)"
            type="number"
            step="any"
            placeholder="76.2673"
            value={venueLng}
            onChange={(e) => setVenueLng(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Required Headcount"
            type="number"
            min={1}
            required
            value={headcount}
            onChange={(e) => setHeadcount(Number(e.target.value))}
          />
          <Input
            label="Pay Per Server (₹)"
            type="number"
            min={0}
            required
            value={payPerPerson}
            onChange={(e) => setPayPerPerson(Number(e.target.value))}
          />
        </div>

        <div>
          <Input
            label="Banquet Dress Code"
            placeholder="Black trousers, white shirt, black formal shoes"
            value={dressCode}
            onChange={(e) => setDressCode(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="On-Site Coordinator Name"
            placeholder="e.g. John Doe"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <Input
            label="Coordinator Mobile"
            placeholder="+91 98765 43210"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Special Instructions & Venue Notes"
            placeholder="Report 30 mins early at staff gate; carry government ID proof."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 bg-[#faf8f5] p-3 rounded-2xl">
          <input
            id="publishImmediately"
            type="checkbox"
            checked={publishImmediately}
            onChange={(e) => setPublishImmediately(e.target.checked)}
            className="w-4 h-4 rounded text-[#e66434] focus:ring-[#e66434] accent-[#e66434] cursor-pointer"
          />
          <label htmlFor="publishImmediately" className="text-xs font-semibold text-stone-700 cursor-pointer select-none">
            Publish shift immediately (Visible in staff mobile app)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#dad0c3]/40">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {publishImmediately ? 'Create & Publish Shift' : 'Save Shift as Draft'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
