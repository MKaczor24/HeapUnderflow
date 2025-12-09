"use client";

import { useState, useRef } from "react";
import { useAuthStore, UserPrefs } from "@/store/Auth";
import { avatars, storage } from "@/models/client/config";
import { avatarsBucket } from "@/models/name";
import { ShineBorder, Button, Input } from "@/components/ui";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Models, ID } from "appwrite";
import {
  IconDeviceFloppy,
  IconEdit,
  IconX,
  IconCamera,
} from "@tabler/icons-react";

interface ProfileHeaderProps {
  user: Models.User<UserPrefs>;
  prefs: UserPrefs;
  stats: {
    reputation: number;
    questions: number;
    answers: number;
  };
}

export default function ProfileHeader({
  user: profileUser,
  prefs,
  stats,
}: ProfileHeaderProps) {
  const { user: loggedInUser } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profileUser.name,
    bio: prefs.bio || "",
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwner = loggedInUser?.$id === profileUser.$id;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setLoading(true);

    try {
      let avatarId = prefs.avatarId;
      if (file) {
        const uploadedFile = await storage.createFile(
          avatarsBucket,
          ID.unique(),
          file,
        );
        avatarId = uploadedFile.$id;
      }

      const promise = axios.put("/api/users", {
        userId: profileUser.$id,
        name: formData.name,
        bio: formData.bio,
        avatarId,
      });

      await toast.promise(promise, {
        loading: "Updating profile...",
        success: "Profile updated successfully",
        error: "Failed to update profile",
      });

      setIsEditing(false);
      setFile(null);
      setPreview(null);
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileUser.name,
      bio: prefs.bio || "",
    });
    setIsEditing(false);
    setFile(null);
    setPreview(null);
  };

  const avatarSrc = preview
    ? preview
    : prefs.avatarId
      ? storage.getFileView(avatarsBucket, prefs.avatarId).toString()
      : avatars.getInitials(profileUser.name, 128, 128).toString();

  return (
    <div className="relative mb-12 flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-neutral-50/10 bg-neutral-900/50 p-8 text-center shadow-2xl backdrop-blur-xl md:flex-row md:text-left">
      <ShineBorder
        className="absolute inset-0"
        shineColor={["#3B82F6", "#8B5CF6", "#EC4899", "#3B82F6"]}
      />
      <div className="relative z-10">
        <div className="group relative h-32 w-32 overflow-hidden rounded-full border-4 border-neutral-800 shadow-xl">
          <Image
            src={avatarSrc}
            alt={profileUser.name}
            fill
            className="object-cover"
          />
          {isEditing && (
            <div
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-neutral-950/50 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconCamera className="text-neutral-50" size={32} />
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <div className="relative z-10 w-full flex-1">
        <div className="flex flex-col gap-2">
          {isEditing ? (
            <div className="flex w-full max-w-md flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="name"
                  className="text-left text-sm text-neutral-400"
                >
                  Username
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="border-neutral-700 bg-neutral-800"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="bio"
                  className="text-left text-sm text-neutral-400"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className="flex min-h-20 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 placeholder:text-neutral-400 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-neutral-50">
                {profileUser.name}
              </h1>
              <p className="mt-2 text-neutral-400">
                {prefs.bio || "No bio provided."}
              </p>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 md:justify-start">
          <div className="rounded-full bg-neutral-800 px-4 py-1 text-sm font-medium text-neutral-300">
            <span className="mr-2 font-bold text-purple-400">
              {stats.reputation}
            </span>
            Reputation
          </div>
          <div className="rounded-full bg-neutral-800 px-4 py-1 text-sm font-medium text-neutral-300">
            <span className="mr-2 font-bold text-blue-400">
              {stats.questions}
            </span>
            Questions
          </div>
          <div className="rounded-full bg-neutral-800 px-4 py-1 text-sm font-medium text-neutral-300">
            <span className="mr-2 font-bold text-pink-400">
              {stats.answers}
            </span>
            Answers
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="relative z-10 flex gap-2 self-start md:self-center">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={loading}
                size="icon"
                title="Save"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 p-2 text-neutral-50 transition-colors duration-300 hover:bg-green-600"
              >
                <IconDeviceFloppy size={20} />
              </Button>
              <Button
                onClick={handleCancel}
                disabled={loading}
                size="icon"
                title="Cancel"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 p-2 text-neutral-50 transition-colors duration-300 hover:bg-red-600"
              >
                <IconX size={20} />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              size="icon"
              title="Edit Profile"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 hover:bg-neutral-700"
            >
              <IconEdit size={20} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
