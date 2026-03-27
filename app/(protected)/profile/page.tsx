"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { getProfileRoute } from "@/lib/profileUtils";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role) {
      router.replace(getProfileRoute(user.role));
    }
  }, [user?.role, router]);

  return null;
}