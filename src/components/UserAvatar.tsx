"use client";

import { avatars, storage } from "@/models/client/config";
import { avatarsBucket } from "@/models/name";
import Image from "next/image";
import React from "react";

type Props = {
  avatarId?: string;
  name: string;
  className?: string;
  width?: number;
  height?: number;
  previewUrl?: string | null;
};

export default function UserAvatar({
  avatarId,
  name,
  className = "",
  width = 24,
  height = 24,
  previewUrl,
}: Props) {
  const src =
    previewUrl ||
    (avatarId
      ? storage.getFileView(avatarsBucket, avatarId).toString()
      : avatars.getInitials(name, width, height).toString());

  return (
    <Image
      src={src}
      alt={name}
      width={width}
      height={height}
      className={`rounded-full object-cover ${className}`}
    />
  );
}
