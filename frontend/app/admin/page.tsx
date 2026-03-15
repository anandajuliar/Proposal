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
      <div className="min-h-screen flex items-center justify-center font-bold text-[#b0413e]">
        Loading dashboard...
      </div>
    );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white font-serif text-gray-800">
        <nav className="flex justify-between items-center p-5 bg-gray-50 border-b border-gray-200 text-sm font-sans sticky top-0 z-10">
          <div className="font-bold text-[#b0413e] text-lg tracking-wider flex items-center gap-3">
            <span className="bg-[#b0413e] text-white px-2 py-1 rounded text-sm">
              CP
            </span>
            CONTRARIUS PORTAL
          </div>
          <div className="flex gap-10 items-center">
            <span className="bg-[#b0413e] text-white px-3 py-1 rounded-full font-bold text-xs">
              {user?.role}
            </span>
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
                      <td className="py-3 font-bold text-green-600">
                        {item.status}
                      </td>
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
                  <th className="py-2 font-bold w-2/5">Event name</th>
                  <th className="py-2 font-bold w-1/5">Organizer</th>
                  <th className="py-2 font-bold w-1/5">Creation date</th>
                  <th className="py-2 font-bold w-1/5">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.submitted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
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
                      <td className="py-3">
                        {item.organizer_name || item.firstname}
                      </td>
                      <td className="py-3 text-gray-600">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3">
                        {/* DROPDOWN UNTUK ADMIN/SUPER ADMIN, LABEL UNTUK USER BIASA */}
                        {user?.role === "ADMIN" ||
                        user?.role === "SUPER ADMIN" ? (
                          <select
                            className="border border-gray-300 p-1 rounded bg-gray-50 text-xs font-bold w-full focus:outline-none focus:border-[#b0413e]"
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
                            className={`px-2 py-1 text-xs font-bold rounded ${
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
                  <th className="py-2 font-bold w-[25%]">Created By</th>
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
                      <td className="py-3">
                        {item.organizer_name || item.firstname}
                      </td>
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

          {/* ========================================================= */}
          {/* BAGIAN KHUSUS SUPER ADMIN */}
          {/* ========================================================= */}
          {user?.role === "SUPER ADMIN" && (
            <div className="mt-16 pt-8 border-t-2 border-dashed border-[#b0413e]">
              <h2 className="text-3xl font-bold text-[#b0413e] mb-8 font-serif">
                🛡️ Super Admin Control Panel
              </h2>

              {/* USER MANAGEMENT */}
              <section className="mb-12">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  User Management
                </h3>
                <table className="w-full text-left border-collapse text-sm bg-gray-50 shadow-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-3 border-b">Name</th>
                      <th className="p-3 border-b">Email</th>
                      <th className="p-3 border-b">Role</th>
                      <th className="p-3 border-b text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id_user} className="border-b border-gray-200">
                        <td className="p-3 font-semibold text-[#b0413e]">
                          {u.firstname} {u.lastname}
                        </td>
                        <td className="p-3 text-gray-600">{u.email}</td>
                        <td className="p-3">
                          <select
                            className="border border-gray-300 p-1 rounded bg-white text-xs font-bold focus:outline-none focus:border-[#b0413e]"
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
                        <td className="p-3 text-right">
                          {u.id_user !== user.id_user && (
                            <button
                              onClick={() => handleDeleteUser(u.id_user)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* EMAIL TEMPLATES */}
              <section className="mb-12">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📧 Email Templates (Auto-Reply)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {templates.map((tpl: any) => (
                    <div
                      key={tpl.id}
                      className="border border-gray-300 p-5 rounded bg-white shadow-sm"
                    >
                      <h4 className="font-bold mb-3 flex items-center gap-2 text-sm text-gray-600">
                        Trigger Status:
                        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs uppercase tracking-wider">
                          {tpl.status_trigger}
                        </span>
                      </h4>
                      <input
                        type="text"
                        defaultValue={tpl.subject}
                        id={`subj-${tpl.id}`}
                        className="w-full border-b border-gray-300 py-2 mb-4 font-bold text-[#b0413e] focus:outline-none focus:border-[#b0413e]"
                        placeholder="Email Subject"
                      />
                      <textarea
                        defaultValue={tpl.body}
                        id={`body-${tpl.id}`}
                        rows={4}
                        className="w-full border border-gray-300 p-3 mb-4 rounded text-sm focus:outline-none focus:border-[#b0413e] bg-gray-50"
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
                        className="w-full bg-[#b0413e] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#8e3431] transition-colors"
                      >
                        Save Template
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
