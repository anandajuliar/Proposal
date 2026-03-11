"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";

export default function AdminOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState({
    proceedings: [],
    submitted: [],
    drafts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // PROTEKSI ROLE
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== "ADMIN") {
        router.push("/admin/proposal"); // Lempar user biasa ke form
      } else {
        fetchOverviewData();
      }
    }
  }, [router]);

  const fetchOverviewData = async () => {
    try {
      const res = await fetch("http://localhost:3001/admin/overview");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Gagal narik data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-[#b0413e]">
        Loading dashboard...
      </div>
    );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white font-serif text-gray-800">
        <nav className="flex justify-between items-center p-5 bg-gray-50 border-b border-gray-200 text-sm font-sans sticky top-0">
          {/* GANTI NAMA BRAND */}
          <div className="font-bold text-[#b0413e] text-lg tracking-wider">
            PUBLISHER PORTAL
          </div>
          <div className="flex gap-10">
            <Link
              href="/admin"
              className="font-bold border-b-2 border-[#b0413e]"
            >
              Overview
            </Link>
            <Link href="/admin/proposal" className="hover:text-black">
              Proceedings proposal
            </Link>
            <button
              onClick={handleLogout}
              className="hover:text-black hover:underline"
            >
              Logout
            </button>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto p-10 font-sans">
          <h1 className="text-4xl text-[#b0413e] mb-6 font-serif">
            Proceedings organiser environment
          </h1>

          {/* BACKGROUND PADA TOMBOL NEW PROPOSAL */}
          <Link
            href="/admin/proposal"
            className="bg-[#b0413e] text-white px-6 py-2 rounded-md hover:bg-[#8e3431] mb-10 inline-block font-bold shadow-md transition-colors"
          >
            + New proceedings proposal
          </Link>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#b0413e] mb-1 font-serif">
              Proceedings
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              List of proceedings and status
            </p>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="py-2 font-bold w-1/4">Code</th>
                  <th className="py-2 font-bold w-2/4">Name</th>
                  <th className="py-2 font-bold w-1/8">Status</th>
                  <th className="py-2 font-bold w-1/8">Delivery date</th>
                </tr>
              </thead>
              <tbody>
                {data.proceedings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-gray-400 border-b"
                    >
                      No proceedings available.
                    </td>
                  </tr>
                ) : (
                  data.proceedings.map((item: any) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3">{item.acronym || "-"}</td>
                      <td className="py-3 text-[#b0413e] font-semibold">
                        {item.event_name}
                      </td>
                      <td className="py-3">{item.status}</td>
                      <td className="py-3">
                        {item.delivery_date
                          ? new Date(item.delivery_date).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#b0413e] mb-1 font-serif">
              Proposals
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              List of submitted proposals
            </p>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="py-2 font-bold w-1/2">Event name</th>
                  <th className="py-2 font-bold w-1/4">Organizer</th>
                  <th className="py-2 font-bold w-1/4">Creation date</th>
                </tr>
              </thead>
              <tbody>
                {data.submitted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-4 text-center text-gray-400 border-b"
                    >
                      No submitted proposals.
                    </td>
                  </tr>
                ) : (
                  data.submitted.map((item: any) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3 text-[#b0413e] font-semibold">
                        {item.event_name}
                      </td>
                      <td className="py-3">{item.organizer_name}</td>
                      <td className="py-3 text-gray-600">
                        {formatDate(item.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#b0413e] mb-1 font-serif">
              Draft Proposals
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              List of drafted proposals
            </p>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="py-2 font-bold w-[45%]">Event name</th>
                  <th className="py-2 font-bold w-[25%]">Organizer</th>
                  <th className="py-2 font-bold w-[20%]">Creation date</th>
                  <th className="py-2 font-bold w-[10%] text-right"></th>
                </tr>
              </thead>
              <tbody>
                {data.drafts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-gray-400 border-b"
                    >
                      No drafts available.
                    </td>
                  </tr>
                ) : (
                  data.drafts.map((item: any) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 text-[#b0413e] font-semibold">
                        {item.event_name}
                      </td>
                      <td className="py-3">{item.organizer_name}</td>
                      <td className="py-3 text-gray-600">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/proposal?id=${item.id}`}
                          className="text-[#b0413e] font-bold hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}
