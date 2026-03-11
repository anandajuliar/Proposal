"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  return (
    <nav className="flex justify-between items-center p-5 bg-gray-50 border-b border-gray-200 text-sm font-sans sticky top-0 z-10">
      <div className="font-bold text-[#b0413e] text-lg tracking-wider">ATLANTIS PRESS</div>
      <div className="flex gap-10 items-center">
        <Link href="/admin" className="text-gray-700 hover:text-[#b0413e] transition-colors">Overview</Link>
        <Link href="/admin/proposal" className="text-gray-700 hover:text-[#b0413e] transition-colors">Proceedings proposal</Link>
        <button 
          onClick={handleLogout}
          className="bg-gray-200 px-4 py-1 rounded hover:bg-red-100 text-gray-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}