"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggle antara Login & Register
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        if (isLogin) {
          // Simpan token ke localStorage buat sesi
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          router.push("/admin"); // Redirect ke dashboard
        } else {
          setIsLogin(true); // Balik ke login setelah register sukses
        }
      } else {
        alert(`Gagal: ${data.message}`);
      }
    } catch (error) {
      alert("Gagal koneksi ke server Backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans p-6">
      <div className="bg-white shadow-2xl rounded-lg flex flex-col md:flex-row max-w-4xl w-full overflow-hidden">
        {/* Sisi Kiri: Branding/Info */}
        <div className="md:w-1/2 bg-[#b0413e] p-12 text-white flex flex-col justify-center">
          <h1 className="text-4xl font-serif font-bold mb-4 tracking-tighter">
            PUBLISHER PORTAL
          </h1>
          <p className="text-lg opacity-80 font-light">
            {isLogin
              ? "Welcome back! Access your proceedings organiser environment."
              : "Join us and start submitting your conference proceedings proposal."}
          </p>
          <div className="mt-8 border-t border-white/20 pt-8">
            <p className="text-sm italic">"Part of Springer Nature Group"</p>
          </div>
        </div>

        {/* Sisi Kanan: Form */}
        <div className="md:w-1/2 p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? "Login" : "Create Account"}
            </h2>
            <p className="text-sm text-gray-500">
              Please enter your credentials below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    onChange={handleChange}
                    className="w-full border-b-2 border-gray-200 focus:border-[#b0413e] outline-none py-2 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    onChange={handleChange}
                    className="w-full border-b-2 border-gray-200 focus:border-[#b0413e] outline-none py-2 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full border-b-2 border-gray-200 focus:border-[#b0413e] outline-none py-2 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                className="w-full border-b-2 border-gray-200 focus:border-[#b0413e] outline-none py-2 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b0413e] text-white font-bold py-3 rounded-md mt-6 hover:bg-[#8e3431] transition-all shadow-lg disabled:bg-gray-400"
            >
              {loading ? "Processing..." : isLogin ? "LOGIN" : "REGISTER"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#b0413e] font-bold hover:underline"
              >
                {isLogin ? "Sign Up Now" : "Back to Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
