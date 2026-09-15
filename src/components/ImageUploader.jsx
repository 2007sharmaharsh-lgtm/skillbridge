import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Link as LinkIcon, User, Check, AlertCircle } from 'lucide-react';

export default function ImageUploader({
  currentImage,
  onImageChange,
  label = 'Profile Photo',
  shape = 'circle', // 'circle' or 'rounded'
  size = 100,
}) {
  const fileInputRef = useRef(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [feedback, setFeedback] = useState(null);

  const showMsg = (msg, isError = false) => {
    setFeedback({ msg, isError });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Image types only
    if (!file.type.startsWith('image/')) {
      showMsg('Please select a valid image file (PNG, JPG, WEBP).', true);
      return;
    }

    // Validation: Size max 10MB
    if (file.size > 10 * 1024 * 1024) {
      showMsg('Image size must be less than 10MB.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const rawResult = uploadEvent.target?.result;
      if (typeof rawResult !== 'string') {
        showMsg('Error processing image.', true);
        return;
      }

      // Automatically downscale and compress via Canvas to ~20-30KB so localStorage never exceeds quota
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 320;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          onImageChange(compressedBase64);
          showMsg('Photo uploaded and optimized!');
        } catch (err) {
          // Fallback if canvas fails
          onImageChange(rawResult);
          showMsg('Photo uploaded!');
        }
      };
      img.onerror = () => {
        onImageChange(rawResult);
        showMsg('Photo uploaded!');
      };
      img.src = rawResult;
    };
    reader.onerror = () => {
      showMsg('Error reading image file.', true);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!urlValue.trim()) return;
    onImageChange(urlValue.trim());
    showMsg('Image URL applied!');
    setUrlValue('');
    setShowUrlInput(false);
  };

  const handleRemove = () => {
    onImageChange('');
    showMsg('Photo removed');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isRound = shape === 'circle';

  return (
    <div style={{ marginBottom: '20px' }}>
      <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
        {label}
      </label>

      {feedback && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '8px',
          marginBottom: '12px',
          fontSize: '0.8rem',
          backgroundColor: feedback.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          color: feedback.isError ? '#f87171' : '#34d399',
          border: `1px solid ${feedback.isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
        }}>
          {feedback.isError ? <AlertCircle size={14} /> : <Check size={14} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Avatar / Photo Display */}
        <div style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: isRound ? '50%' : '14px',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '2px solid rgba(59, 130, 246, 0.4)',
          boxShadow: '0 0 16px rgba(59, 130, 246, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {currentImage ? (
            <img
              src={currentImage}
              alt="Profile Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <User size={size * 0.45} style={{ color: 'var(--text-muted)' }} />
          )}

          {/* Overlay Click Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload new image"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              opacity: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
          >
            <Camera size={24} />
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
            >
              <Upload size={14} /> Upload Image from Computer
            </button>

            {currentImage && (
              <button
                type="button"
                onClick={handleRemove}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  color: '#f87171',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)'
                }}
              >
                <Trash2 size={14} /> Remove Photo
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowUrlInput((prev) => !prev)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
            >
              <LinkIcon size={14} /> {showUrlInput ? 'Cancel URL' : 'Use Web URL'}
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Supports JPG, PNG, WEBP or GIF. Max file size: 5MB.
          </div>

          {/* Optional Web URL input */}
          {showUrlInput && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <input
                type="url"
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.85rem', width: '280px', borderRadius: '6px' }}
                placeholder="https://example.com/photo.jpg"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '6px' }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
