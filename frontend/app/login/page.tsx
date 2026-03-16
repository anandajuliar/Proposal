"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
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
      const res = await fetch(`http://localhost:3001/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        if (isLogin) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          router.push("/admin");
        } else {
          setIsLogin(true);
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
      
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
        <div className="md:w-3/5 bg-[#D24A46] p-10 flex flex-col justify-center relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 z-10 h-full">
            <div className="relative flex-shrink-0 w-40 h-40 md:w-48 md:h-48 rounded-full bg-[#ffffff] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.4),_inset_-6px_-6px_12px_rgba(255,255,255,0.08),_10px_10px_20px_rgba(0,0,0,0.3)] flex items-center justify-center p-6">
              <img 
                src="/icon.png" 
                alt="Contrarius Big Logo" 
                className="w-full h-full object-contain drop-shadow-2xl" 
              />
            </div>

            <div className="flex flex-col text-white text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="text-3xl font-bold tracking-wider">CONTRARIUS</h1>
              </div>
              <p className="text-white text-lg leading-relaxed max-w-xs">
                {isLogin
                  ? "Welcome back! Access your proceedings organiser environment."
                  : "Join us and start submitting your conference proceedings proposal."}
              </p>
            </div>

          </div>

          <p className="absolute bottom-6 left-10 text-sm text-white font-medium italic">
            "Part of Contrarius Actus Group"
          </p>
        </div>

        <div className="md:w-2/5 p-12 bg-white flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#3B4D6A]">
              {isLogin ? "Login" : "Create Account"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Please enter your credentials below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Munculin Input Nama kalau lagi mode Register */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-2 tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    onChange={handleChange}
                    className="w-full bg-[#f0f4f8] text-gray-800 placeholder-gray-400 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all"
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-2 tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    onChange={handleChange}
                    className="w-full bg-[#f0f4f8] text-gray-800 placeholder-gray-400 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all"
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Input Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-2 tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full bg-[#f0f4f8] text-gray-800 placeholder-gray-400 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
            
            {/* Input Password */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-2 tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                className="w-full bg-[#f0f4f8] text-gray-800 placeholder-gray-400 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D24A46] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B4D6A] text-white font-bold py-3 px-4 rounded-md mt-6 hover:bg-[#2a374b] active:scale-95 transition-all duration-200 shadow-lg disabled:bg-gray-400"
            >
              {loading ? "Processing..." : isLogin ? "LOGIN" : "REGISTER"}
            </button>

          </form>

          {/* Toggle Login/Register */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button" // Biar gak ke-trigger submit form
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#D24A46] font-bold cursor-pointer hover:underline focus:outline-none"
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