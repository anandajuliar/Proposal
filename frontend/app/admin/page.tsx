"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";

export default function AdminOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({
    proceedings: [],
    submitted: [],
    drafts: [],
  });
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      fetchOverviewData(parsedUser);
      if (parsedUser.role === "SUPER ADMIN") {
        fetchUsers();
        fetchTemplates();
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchOverviewData = async (u: any) => {
    try {
      // 🟢 PRODUCTION: const res = await fetch(`https://api.contrariusactus.com/api/admin/overview?userId=${u.id_user}&role=${u.role}`);
      // 🔵 DEVELOPMENT:
      const res = await fetch(
        `http://localhost:3001/api/admin/overview?userId=${u.id_user}&role=${u.role}`,
      );
      if (res.ok) {
        const result = await res.json();
        setData({
          proceedings: result.proceedings.filter(
            (p: any) => p.status === "APPROVED",
          ), // Sesuai kodingan awalmu
          submitted: result.proceedings.filter(
            (p: any) => p.status !== "APPROVED",
          ), // Tampilkan yg submitted, on review, rejected di sini
          drafts: result.drafts,
        });
      }
    } catch (error) {
      console.error("Gagal narik data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    // 🟢 PRODUCTION: const res = await fetch(`https://api.contrariusactus.com/api/admin/users`);
    const res = await fetch(`http://localhost:3001/api/admin/users`);
    if (res.ok) setUsers(await res.json());
  };

  const fetchTemplates = async () => {
    // 🟢 PRODUCTION: const res = await fetch(`https://api.contrariusactus.com/api/admin/templates`);
    const res = await fetch(`http://localhost:3001/api/admin/templates`);
    if (res.ok) setTemplates(await res.json());
  };

  const handleStatusChange = async (proposalId: number, newStatus: string) => {
    if (
      !window.confirm(
        `Ubah status menjadi ${newStatus}? (Otomatis mengirim dummy email ke user)`,
      )
    )
      return;

    // 🟢 PRODUCTION: const url = `https://api.contrariusactus.com/api/admin/proposals/${proposalId}/status`;
    const url = `http://localhost:3001/api/admin/proposals/${proposalId}/status`;

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      alert("Status updated!");
      fetchOverviewData(user);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    // 🟢 PRODUCTION: const url = `https://api.contrariusactus.com/api/admin/users/${userId}/role`;
    const url = `http://localhost:3001/api/admin/users/${userId}/role`;

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      alert("Role updated!");
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !window.confirm(
        "Hapus user ini? (Data proposal akan tetap ada, tapi user tidak bisa login lagi)",
      )
    )
      return;

    // 🟢 PRODUCTION: const url = `https://api.contrariusactus.com/api/admin/users/${userId}`;
    const url = `http://localhost:3001/api/admin/users/${userId}`;

    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) {
      alert("User deleted!");
      fetchUsers();
      fetchOverviewData(user);
    }
  };

  const handleTemplateSave = async (
    id: number,
    subject: string,
    body: string,
  ) => {
    // 🟢 PRODUCTION: const url = `https://api.contrariusactus.com/api/admin/templates/${id}`;
    const url = `http://localhost:3001/api/admin/templates/${id}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    if (res.ok) alert("Template saved!");
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
      <div className="min-h-screen flex items-center justify-center font-bold text-[#3B4D6A] text-xl bg-[#f8fafc]">
        Loading dashboard...
      </div>
    );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-800 pb-20">
        
        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b border-gray-100 text-sm sticky top-0 z-50">
          <div className="font-bold text-[#3B4D6A] text-xl tracking-wider flex items-center gap-3">
            <img 
              src="/icon.png" 
              alt="Contrarius Logo" 
              className="h-9 w-9 object-contain" 
            />
            CONTRARIUS INSTITUTE
          </div>
          <div className="flex gap-8 items-center font-medium">
            {user?.role && (
              <span className="bg-[#D24A46] text-white px-3 py-1 rounded-full font-bold text-xs shadow-sm">
                {user.role}
              </span>
            )}
            <Link
              href="/admin"
              className="text-[#3B4D6A] font-bold border-b-2 border-[#D24A46] pb-1"
            >
              Overview
            </Link>
            <Link href="/admin/proposal" className="text-[#64748B] hover:text-[#3B4D6A] transition-colors duration-200">
              Proceedings proposal
            </Link>
            <button
              onClick={handleLogout}
              className="bg-transparent border-2 border-[#D24A46] text-[#D24A46] px-5 py-1.5 rounded-md hover:bg-[#D24A46] hover:text-white transition-all duration-300 font-bold shadow-sm active:scale-95"
            >
              LOGOUT
            </button>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto p-10 mt-4">
          
          {/* HEADER */}
          <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-4xl font-extrabold text-[#3B4D6A] tracking-tight mb-2">
                Proceedings organiser environment
              </h1>
              <p className="text-gray-500 text-lg">
                Manage and track your proceeding proposals seamlessly.
              </p>
            </div>
            
            <Link
              href="/admin/proposal"
              className="bg-[#D24A46] text-white px-6 py-3 rounded-md hover:bg-[#b83e3a] font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="text-xl leading-none">+</span> New proceedings proposal
            </Link>
          </div>

          {/* SECTION 1: PROCEEDINGS */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
            <h2 className="text-2xl font-bold text-[#3B4D6A] mb-1">
              Proceedings
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              List of proceedings and status
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-3 font-bold w-1/4 text-[#3B4D6A] uppercase tracking-wider text-xs">Code</th>
                    <th className="py-3 font-bold w-2/4 text-[#3B4D6A] uppercase tracking-wider text-xs">Name</th>
                    <th className="py-3 font-bold w-1/8 text-[#3B4D6A] uppercase tracking-wider text-xs">Status</th>
                    <th className="py-3 font-bold w-1/8 text-[#3B4D6A] uppercase tracking-wider text-xs">Delivery date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.proceedings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                        No proceedings available.
                      </td>
                    </tr>
                  ) : (
                    data.proceedings.map((item: any) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-[#f0f4f8] transition-colors">
                        <td className="py-4 font-medium text-gray-600">{item.acronym || "-"}</td>
                        <td className="py-4 text-[#3B4D6A] font-bold">
                          {item.event_name}
                        </td>
                        <td className="py-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 text-gray-600">
                          {item.delivery_date
                            ? new Date(item.delivery_date).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 2: PROPOSALS */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
            <h2 className="text-2xl font-bold text-[#3B4D6A] mb-1">
              Proposals
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              List of submitted proposals
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-3 font-bold w-2/5 text-[#3B4D6A] uppercase tracking-wider text-xs">Event name</th>
                    <th className="py-3 font-bold w-1/5 text-[#3B4D6A] uppercase tracking-wider text-xs">Organizer</th>
                    <th className="py-3 font-bold w-1/5 text-[#3B4D6A] uppercase tracking-wider text-xs">Creation date</th>
                    <th className="py-3 font-bold w-1/5 text-[#3B4D6A] uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.submitted.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                        No submitted proposals.
                      </td>
                    </tr>
                  ) : (
                    data.submitted.map((item: any) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-[#f0f4f8] transition-colors">
                        <td className="py-4 text-[#3B4D6A] font-bold">
                          {item.event_name}
                        </td>
                        <td className="py-4 font-medium text-gray-600">
                          {item.organizer_name || item.firstname}
                        </td>
                        <td className="py-4 text-gray-500 text-xs">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="py-4">
                          {/* DROPDOWN UNTUK ADMIN/SUPER ADMIN, LABEL UNTUK USER BIASA */}
                          {user?.role === "ADMIN" ||
                          user?.role === "SUPER ADMIN" ? (
                            <select
                              className="border border-gray-300 p-2 rounded-md bg-[#f0f4f8] text-xs font-bold w-full focus:outline-none focus:ring-2 focus:ring-[#3B4D6A] cursor-pointer"
                              value={item.status}
                              onChange={(e) =>
                                handleStatusChange(item.id, e.target.value)
                              }
                            >
                              <option value="SUBMITTED">SUBMITTED</option>
                              <option value="ON_REVIEW">ON REVIEW</option>
                              <option value="APPROVED">APPROVED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 text-xs font-bold rounded-full ${
                                item.status === "APPROVED"
                                  ? "bg-green-100 text-green-700"
                                  : item.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 3: DRAFT PROPOSALS */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-12">
            <h2 className="text-2xl font-bold text-[#3B4D6A] mb-1">
              Draft Proposals
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              List of drafted proposals
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-3 font-bold w-[45%] text-[#3B4D6A] uppercase tracking-wider text-xs">Event name</th>
                    <th className="py-3 font-bold w-[25%] text-[#3B4D6A] uppercase tracking-wider text-xs">Created By</th>
                    <th className="py-3 font-bold w-[20%] text-[#3B4D6A] uppercase tracking-wider text-xs">Creation date</th>
                    <th className="py-3 font-bold w-[10%] text-right text-[#3B4D6A] uppercase tracking-wider text-xs">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.drafts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                        No drafts available.
                      </td>
                    </tr>
                  ) : (
                    data.drafts.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-50 hover:bg-[#f0f4f8] transition-colors"
                      >
                        <td className="py-4 text-[#3B4D6A] font-bold">
                          {item.event_name}
                        </td>
                        <td className="py-4 font-medium text-gray-600">
                          {item.organizer_name || item.firstname}
                        </td>
                        <td className="py-4 text-gray-500 text-xs">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="py-4 text-right">
                          <Link
                            href={`/admin/proposal?id=${item.id}`}
                            className="text-[#D24A46] font-bold hover:underline underline-offset-4"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ========================================================= */}
          {/* BAGIAN KHUSUS SUPER ADMIN */}
          {/* ========================================================= */}
          {user?.role === "SUPER ADMIN" && (
            <div className="mt-16 pt-12 border-t-2 border-dashed border-gray-300">
              <div className="mb-10 text-center">
                <span className="bg-[#3B4D6A] text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-widest shadow-md">
                  SUPER ADMIN AREA
                </span>
              </div>

              {/* USER MANAGEMENT */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
                <h3 className="text-xl font-bold text-[#3B4D6A] mb-6">
                  User Management
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-[#f0f4f8]">
                      <tr>
                        <th className="p-4 font-bold text-[#3B4D6A] uppercase tracking-wider text-xs rounded-tl-lg">Name</th>
                        <th className="p-4 font-bold text-[#3B4D6A] uppercase tracking-wider text-xs">Email</th>
                        <th className="p-4 font-bold text-[#3B4D6A] uppercase tracking-wider text-xs">Role</th>
                        <th className="p-4 font-bold text-[#3B4D6A] uppercase tracking-wider text-xs text-right rounded-tr-lg">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u.id_user} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-[#3B4D6A]">
                            {u.firstname} {u.lastname}
                          </td>
                          <td className="p-4 text-gray-600">{u.email}</td>
                          <td className="p-4">
                            <select
                              className="border border-gray-300 p-2 rounded-md bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#3B4D6A] cursor-pointer"
                              value={u.role}
                              onChange={(e) =>
                                handleRoleChange(u.id_user, e.target.value)
                              }
                              disabled={u.id_user === user.id_user}
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="SUPER ADMIN">SUPER ADMIN</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            {u.id_user !== user.id_user && (
                              <button
                                onClick={() => handleDeleteUser(u.id_user)}
                                className="bg-transparent border border-[#D24A46] text-[#D24A46] px-4 py-1.5 rounded-md text-xs font-bold hover:bg-[#D24A46] hover:text-white transition-all"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* EMAIL TEMPLATES */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-[#3B4D6A] mb-6">
                  Email Templates (Auto-Reply)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {templates.map((tpl: any) => (
                    <div
                      key={tpl.id}
                      className="border border-gray-200 p-6 rounded-xl bg-[#f0f4f8]"
                    >
                      <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-3">
                        <span className="font-bold text-sm text-gray-500 uppercase">Trigger:</span>
                        <span className="bg-[#3B4D6A] text-white px-3 py-1 rounded text-xs font-bold tracking-wider">
                          {tpl.status_trigger}
                        </span>
                      </div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Subject</label>
                      <input
                        type="text"
                        defaultValue={tpl.subject}
                        id={`subj-${tpl.id}`}
                        className="w-full bg-white text-[#3B4D6A] border border-gray-200 p-3 rounded-md mb-4 font-bold focus:outline-none focus:ring-2 focus:ring-[#D24A46]"
                        placeholder="Email Subject"
                      />
                      <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Body Message</label>
                      <textarea
                        defaultValue={tpl.body}
                        id={`body-${tpl.id}`}
                        rows={5}
                        className="w-full bg-white border border-gray-200 p-3 mb-6 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D24A46]"
                        placeholder="Email Body"
                      ></textarea>
                      <button
                        onClick={() => {
                          const subj = (
                            document.getElementById(
                              `subj-${tpl.id}`,
                            ) as HTMLInputElement
                          ).value;
                          const body = (
                            document.getElementById(
                              `body-${tpl.id}`,
                            ) as HTMLTextAreaElement
                          ).value;
                          handleTemplateSave(tpl.id, subj, body);
                        }}
                        className="w-full bg-[#3B4D6A] text-white px-4 py-3 rounded-md text-sm font-bold hover:bg-[#2a374b] transition-all shadow-md active:scale-95"
                      >
                        SAVE TEMPLATE
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}