"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export default function AdminOverviewPage() {
  const [data, setData] = useState({ proceedings: [], submitted: [], drafts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/admin/overview")
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Helper buat warna status
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-6xl mx-auto p-10 font-sans">
          <h1 className="text-4xl text-[#b0413e] mb-2 font-serif">Proceedings organiser environment</h1>
          <Link href="/admin/proposal" className="text-[#b0413e] hover:underline mb-10 inline-block">+ New proceedings proposal</Link>

          {/* Section Table (Ulangi untuk Submitted & Draft) */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 font-serif border-b-2 border-[#b0413e] w-fit pr-10">Proposals</h2>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-400 uppercase text-xs">
                  <th className="py-3">Event Name</th>
                  <th className="py-3">Organizer</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.submitted.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-bold">{item.event_name}</td>
                    <td className="py-4 text-gray-600">{item.organizer_name}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link href={`/admin/proposal?id=${item.id}`} className="text-gray-400 hover:text-black">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}