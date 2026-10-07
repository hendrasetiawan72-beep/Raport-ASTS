import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link, Check, AlertCircle, RefreshCw } from 'lucide-react';
import {
  compressProfilePhoto,
  compressSignatureImage,
  compressLogoImage,
} from '../../utils/imageUpload';

interface PhotoUploaderProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  helperText?: string;
  shape?: 'circle' | 'square' | 'signature';
  type?: 'avatar' | 'signature' | 'logo';
  maxHeightPx?: number;
  placeholderText?: string;
  allowUrlFallback?: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  value = '',
  onChange,
  label,
  helperText,
  shape = 'square',
  type = 'avatar',
  maxHeightPx,
  placeholderText = 'Unggah gambar dari perangkat',
  allowUrlFallback = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      let compressed = '';
      if (type === 'signature') {
        compressed = await compressSignatureImage(file);
      } else if (type === 'logo') {
        compressed = await compressLogoImage(file);
      } else {
        compressed = await compressProfilePhoto(file);
      }
      onChange(compressed);
      setUrlDraft(compressed);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses gambar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUrlDraft('');
    setErrorMessage(null);
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setShowUrlInput(false);
      setErrorMessage(null);
    }
  };

  const shapeClasses =
    shape === 'circle'
      ? 'w-24 h-24 rounded-full'
      : shape === 'signature'
      ? 'w-full h-28 rounded-xl'
      : 'w-24 h-24 rounded-2xl';

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#4A4036] uppercase tracking-wider">
            {label}
          </label>
          {allowUrlFallback && (
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] font-semibold text-[#5A7365] hover:text-[#3B4E43] flex items-center gap-1 transition-colors"
            >
              <Link className="w-3 h-3" />
              <span>{showUrlInput ? 'Tutup URL' : 'Gunakan URL Gambar'}</span>
            </button>
          )}
        </div>
      )}

      {/* URL Fallback Input */}
      {showUrlInput && (
        <div className="flex items-center gap-2 p-2 bg-[#F5F2EB] rounded-xl border border-[#DFD8CC]">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://... URL gambar"
            className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-[#D5CDBD] text-xs font-mono outline-none focus:ring-2 focus:ring-[#7E9685]"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1.5 bg-[#5A7365] hover:bg-[#455B4F] text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Terapkan</span>
          </button>
        </div>
      )}

      {/* Upload Zone / Preview Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-4 ${
          isDragging
            ? 'border-[#5A7365] bg-[#EDF3EF]'
            : value
            ? 'border-[#D9D1C3] bg-[#FCFBF8] hover:border-[#B5AB9A]'
            : 'border-[#DFD7C7] bg-[#F7F4EE] hover:bg-[#F2EEE6] hover:border-[#BDB3A1]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Thumbnail Preview or Icon */}
        <div
          className={`shrink-0 overflow-hidden border border-[#D9D1C3] flex items-center justify-center bg-white shadow-2xs relative ${shapeClasses}`}
          style={maxHeightPx ? { maxHeight: `${maxHeightPx}px` } : undefined}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center text-[#5A7365]">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
          ) : value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={() => setErrorMessage('Gambar tidak dapat dimuat')}
            />
          ) : (
            <div className="text-[#8C8275] flex flex-col items-center justify-center p-2 text-center">
              <ImageIcon className="w-6 h-6 mb-1 opacity-70" />
              <span className="text-[10px] uppercase font-semibold">Kosong</span>
            </div>
          )}
        </div>

        {/* Actions & Description */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold text-[#3E342B] flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#5A7365]" />
              <span>{value ? 'Klik untuk mengganti gambar' : placeholderText}</span>
            </span>
          </div>

          <p className="text-[11px] text-[#7A7063]">
            {helperText || 'Format didukung: JPG, PNG, WEBP. Kompresi otomatis ke Base64 aman.'}
          </p>

          {value && (
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-[10px] font-bold text-[#3B624A] bg-[#E8EFEA] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Tersimpan</span>
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-semibold text-[#A84A3B] hover:text-[#802D20] px-2 py-0.5 rounded hover:bg-[#FBEBE8] transition-colors inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Hapus Foto</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="text-[11px] text-[#A84A3B] flex items-center gap-1 font-semibold">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
