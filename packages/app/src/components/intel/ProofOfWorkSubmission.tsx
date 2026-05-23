'use client';

import React, { useState, useRef } from 'react';
import { BiologicalPowSource } from '@promethea/lib';
import { Camera, Mic, Upload, MapPin, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface ProofOfWorkSubmissionProps {
  taskId: string;
  syndicateId: string;
  onSuccess?: (payloadId: string) => void;
  onCancel?: () => void;
}

export function ProofOfWorkSubmission({ taskId, syndicateId, onSuccess, onCancel }: ProofOfWorkSubmissionProps) {
  const [sourceType, setSourceType] = useState<BiologicalPowSource>('PHOTO');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const captureLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file or capture media to submit as Proof of Work.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatusMessage('Capturing geospacial telemetry...');

    try {
      // 1. Gather Metadata
      let location = undefined;
      try {
        location = await captureLocation();
      } catch (locErr) {
        console.warn('Could not capture location', locErr);
      }

      setStatusMessage('Uploading verifiable payload to storage...');

      // In a real implementation, we would upload to Firebase Storage or S3 here
      // For this implementation, we will simulate the upload URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      const simulatedMediaUrl = `s3://promethea-pow-vault/${taskId}/${file.name}`;

      setStatusMessage('Ingesting Proof of Work into Oracle Engine...');

      // 2. Construct Payload
      const payload = {
        citizenId: 'current-citizen-id', // Would come from auth context
        taskId,
        syndicateId,
        sourceType,
        mediaUrl: simulatedMediaUrl,
        fileSizeCents: file.size,
        metadata: {
          lat: location?.lat,
          lng: location?.lng,
          deviceModel: navigator.userAgent,
        }
      };

      // 3. Send to API
      const response = await fetch('/api/pow/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit Proof of Work');
      }

      setStatusMessage('Submission successful. Awaiting Oracle verification.');
      
      // Simulate verification delay to show UI state
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data.payloadId);
        }
      }, 1500);

    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl max-w-lg w-full">
      <h3 className="text-xl font-orbitron font-semibold text-teal-400 mb-2">Biological Proof of Work</h3>
      <p className="text-slate-400 text-sm mb-6">Capture or upload deterministic sensory data to prove actualization.</p>

      {/* Source Type Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { type: 'PHOTO' as BiologicalPowSource, icon: <Camera size={18} />, label: 'Photo' },
          { type: 'VIDEO' as BiologicalPowSource, icon: <Camera size={18} />, label: 'Video' },
          { type: 'AUDIO' as BiologicalPowSource, icon: <Mic size={18} />, label: 'Audio' },
          { type: 'LIDAR' as BiologicalPowSource, icon: <MapPin size={18} />, label: 'LiDAR' },
          { type: 'IOT_SENSOR' as BiologicalPowSource, icon: <Upload size={18} />, label: 'IoT Data' }
        ].map((item) => (
          <button
            key={item.type}
            onClick={() => setSourceType(item.type)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
              sourceType === item.type
                ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}
          >
            <div className="mb-2">{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Upload/Capture Area */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 rounded-xl p-8 mb-6 text-center cursor-pointer hover:border-teal-500/50 hover:bg-slate-800/30 transition-colors"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept={sourceType === 'PHOTO' ? 'image/*' : sourceType === 'VIDEO' ? 'video/*' : sourceType === 'AUDIO' ? 'audio/*' : '*/*'}
          capture={sourceType === 'PHOTO' || sourceType === 'VIDEO' ? 'environment' : undefined}
        />
        {file ? (
          <div className="flex flex-col items-center text-teal-400">
            <CheckCircle className="mb-2" size={32} />
            <span className="font-medium">{file.name}</span>
            <span className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-500">
            <Upload className="mb-3" size={32} />
            <span className="font-medium text-slate-300">Click to Select or Capture Media</span>
            <span className="text-xs mt-2">Required for Oracle Verification</span>
          </div>
        )}
      </div>

      {/* Status & Errors */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg flex items-start mb-6 text-sm">
          <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      {isSubmitting && statusMessage && (
        <div className="bg-teal-500/10 border border-teal-500/30 text-teal-300 p-4 rounded-lg flex items-center mb-6">
          <Loader2 className="animate-spin mr-3" size={20} />
          <span className="text-sm font-medium">{statusMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 mt-4">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!file || isSubmitting}
          className="px-6 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? 'Processing...' : 'Submit Verification'}
        </button>
      </div>
    </div>
  );
}
