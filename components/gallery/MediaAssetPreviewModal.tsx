"use client";

/**
 * MediaAssetPreviewModal
 *
 * Legacy wrapper — maintained for backwards compatibility with any existing
 * callers outside the GalleryPicker. Internally delegates to MediaPreviewDrawer.
 *
 * For new usages prefer <MediaPreviewDrawer> directly.
 */

import React from "react";
import { MediaAsset } from "@/services/gallery/galleryApi";
import { MediaPreviewDrawer } from "./MediaPreviewDrawer";
import { useTheme } from "@/hooks/useTheme";

interface MediaAssetPreviewModalProps {
  isOpen:      boolean;
  asset:       MediaAsset | null;
  onClose:     () => void;
  onDelete?:   (assetId: string) => Promise<void> | void;
  fromPicker?: boolean;
  onSelect?:   (asset: MediaAsset) => void;
}

export function MediaAssetPreviewModal(props: MediaAssetPreviewModalProps) {
  const { isDarkMode } = useTheme();

  return (
    <MediaPreviewDrawer
      asset={props.asset}
      isOpen={props.isOpen}
      isDarkMode={isDarkMode}
      fromPicker={props.fromPicker ?? false}
      onClose={props.onClose}
      onDelete={props.onDelete}
      onSelect={props.onSelect}
    />
  );
}
