"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Cek apakah ada token di localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      // Kalau nggak ada token, tendang ke login
      setAuthorized(false);
      router.push("/login");
    } else {
      // Kalau ada, izinkan masuk
      setAuthorized(true);
    }
  }, [router]);

  // Selama ngecek token, tampilin loading biar nggak kedip (flicker)
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="font-bold text-[#b0413e] animate-pulse">Checking Access...</p>
      </div>
    );
  }

  return <>{children}</>;
}