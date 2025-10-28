'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  folder: 'restaurants' | 'menuItems' | 'profiles';
  maxSizeMB?: number;
  aspectRatio?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImageUrl, 
  onImageUploaded, 
  folder,
  maxSizeMB = 5,
  aspectRatio = '16/9'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError(null);
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Create unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const filename = `${timestamp}_${randomString}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${filename}`);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          // Handle upload error
          console.error('Upload error:', error);
          setError('Failed to upload image. Please try again.');
          toast.error('Failed to upload image');
          setUploading(false);
          setPreviewUrl(currentImageUrl || null);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onImageUploaded(downloadURL);
            toast.success('Image uploaded successfully!');
            setUploading(false);
            setError(null);
          } catch (error) {
            console.error('Error getting download URL:', error);
            setError('Failed to get image URL');
            toast.error('Failed to get image URL');
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
      toast.error('Failed to upload image');
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        /* Preview with Image */
        <div className="relative group">
          <div 
            className="relative w-full rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100"
            style={{ aspectRatio }}
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                <button
                  onClick={handleClick}
                  disabled={uploading}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change
                </button>
                <button
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </button>
              </div>
            </div>

            {/* Upload Progress Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
                <Loader className="w-12 h-12 text-white animate-spin mb-4" />
                <div className="w-3/4 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-white font-medium mt-4">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Upload Area - No Image */
        <button
          onClick={handleClick}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-2xl hover:border-orange-500 transition-all duration-300 bg-gray-50 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ aspectRatio }}
        >
          <div className="flex flex-col items-center justify-center p-8">
            {uploading ? (
              <>
                <Loader className="w-12 h-12 text-orange-600 animate-spin mb-4" />
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden mb-4">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-gray-700 font-medium">{uploadProgress}% uploaded</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-700 font-medium mb-2">Click to upload image</p>
                <p className="text-gray-500 text-sm">JPEG, PNG, or WebP (max {maxSizeMB}MB)</p>
              </>
            )}
          </div>
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {previewUrl && !uploading && !error && (
        <div className="mt-3 flex items-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Image ready</span>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-3 text-xs text-gray-500">
        <p>Recommended: High-quality images with good lighting</p>
        <p>Max file size: {maxSizeMB}MB • Formats: JPEG, PNG, WebP</p>
      </div>
    </div>
  );
};

export default ImageUpload;

