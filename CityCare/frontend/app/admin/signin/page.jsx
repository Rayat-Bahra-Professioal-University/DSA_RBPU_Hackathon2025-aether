"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function SigninPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3001/adminLogin/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setTimeout(() => {
          router.push("/admin/dashboard"); // ✅ Redirect after success
        }, 100);
      }
    } catch (err) {
      console.error(err);
      setMessage("Signin failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/image.png')] flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-black/80 text-sm">
            Sign in to continue your sustainable journey
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 rounded-xl p-8 shadow-2xl border border-white">
          <div className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/50 border border-slate-600 rounded-lg text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3  bg-white/50 border border-slate-600 rounded-lg text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mt-5 p-4 rounded-lg text-sm font-medium ${
              message.includes('❌') 
                ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              {message}
            </div>
          )}

          {/* Footer */}
          {/* <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              { <a href="/admin/signup" className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
                Sign up
              </a> }
            </p>
          </div> */}
        </div>

        {/* Bottom Text */}
        <p className="text-center text-slate-500 text-xs mt-10">
          Protected by industry-standard encryption and security
        </p>
      </div>
    </div>
  );
}