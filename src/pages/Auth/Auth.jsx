import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Heart, User, Sparkles, LogIn, UserPlus } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('owner'); // 'owner' or 'doctor'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      if (role === 'doctor' && !formData.licenseNumber) {
        toast.error("Medical license number is required for veterinarians.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Mock API latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
      navigate('/');
    } catch (err) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex items-center justify-center py-16 px-6 md:px-12 glow-wrapper">
      <div className="max-w-[1440px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Side: Pitch Column ("Why join us?" & "Who is this for?") */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#bd905b] font-semibold">Join Our Network</span>
            <h1 className="text-4xl md:text-5xl font-light leading-tight">
              Care & advice <span className="text-[#bd905b] font-normal italic block">for every pet.</span>
            </h1>
            <p className="body-standard opacity-80 max-w-lg mt-4">
              Connecting pet owners with verified veterinary professionals for secure, real-time consultations, prescriptions, and healthcare queries.
            </p>
          </div>

          {/* Section: Why Join Us */}
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-[#bd905b] flex items-center gap-2">
              <Sparkles size={20} /> Why Join Us?
            </h3>
            <ul className="space-y-4 text-sm opacity-80">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bd905b] mt-2.5 shrink-0" />
                <span><strong>24/7 Expert Consults:</strong> Connect with certified veterinarians from the comfort of your home.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bd905b] mt-2.5 shrink-0" />
                <span><strong>Digital Prescriptions:</strong> Receive secure, digital treatment plans instantly.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bd905b] mt-2.5 shrink-0" />
                <span><strong>Comprehensive Pet Vault:</strong> Securely store vaccination sheets, weight charts, and consultation history.</span>
              </li>
            </ul>
          </div>

          {/* Section: For Whom */}
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-[#bd905b] flex items-center gap-2">
              <Heart size={20} /> Who Is This For?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="premium-card p-6 border border-white/5 hover:border-[#bd905b]/20">
                <h4 className="font-bold text-[#f7f7f7] mb-2 flex items-center gap-2">
                  <User size={16} className="text-[#bd905b]" /> Pet Owners
                </h4>
                <p className="text-xs opacity-70 leading-relaxed">Ask queries, book schedules, and log all healthcare files securely.</p>
              </div>
              <div className="premium-card p-6 border border-white/5 hover:border-[#bd905b]/20">
                <h4 className="font-bold text-[#f7f7f7] mb-2 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#bd905b]" /> Veterinarians
                </h4>
                <p className="text-xs opacity-70 leading-relaxed">Set flexible remote hours, treat patients online, and manage records.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Forms Panel */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="glass-container w-full max-w-[550px] shadow-2xl relative">
            
            {/* Form Toggle Switcher */}
            <div className="flex border-b border-white/10 mb-8 pb-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 pb-4 text-sm font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                  isLogin ? 'text-[#bd905b] border-b-2 border-[#bd905b]' : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                <LogIn size={16} /> Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-4 text-sm font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                  !isLogin ? 'text-[#bd905b] border-b-2 border-[#bd905b]' : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                <UserPlus size={16} /> Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Role Selection (Only shown during Registration) */}
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-[#a3a3a3]">I am registering as a:</span>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setRole('owner')}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                        role === 'owner' 
                          ? 'border-[#bd905b] bg-[#bd905b]/10 text-white' 
                          : 'border-white/10 bg-[#111111] text-[#a3a3a3] hover:border-white/20'
                      }`}
                    >
                      Pet Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('doctor')}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                        role === 'doctor' 
                          ? 'border-[#bd905b] bg-[#bd905b]/10 text-white' 
                          : 'border-white/10 bg-[#111111] text-[#a3a3a3] hover:border-white/20'
                      }`}
                    >
                      Veterinarian
                    </button>
                  </div>
                </div>
              )}

              {/* Name Field (Only shown during Registration) */}
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs uppercase tracking-widest text-[#a3a3a3]">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#bd905b] px-4 py-3 rounded-xl text-sm outline-none transition-colors text-white"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs uppercase tracking-widest text-[#a3a3a3]">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#111111] border border-white/10 focus:border-[#bd905b] px-4 py-3 rounded-xl text-sm outline-none transition-colors text-white"
                  placeholder="Enter your email"
                />
              </div>

              {/* License Number (Only shown for Vet registration) */}
              {!isLogin && role === 'doctor' && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="licenseNumber" className="text-xs uppercase tracking-widest text-[#a3a3a3]">Medical License Number *</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required={role === 'doctor'}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#bd905b] px-4 py-3 rounded-xl text-sm outline-none transition-colors text-white"
                    placeholder="E.g., VCI-12345"
                  />
                </div>
              )}

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-xs uppercase tracking-widest text-[#a3a3a3]">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#111111] border border-white/10 focus:border-[#bd905b] px-4 py-3 rounded-xl text-sm outline-none transition-colors text-white"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password Field (Only shown during Registration) */}
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="confirmPassword" className="text-xs uppercase tracking-widest text-[#a3a3a3]">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full bg-[#111111] border border-white/10 focus:border-[#bd905b] px-4 py-3 rounded-xl text-sm outline-none transition-colors text-white"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-4 bg-white text-black font-semibold tracking-wider uppercase hover:bg-[#bd905b] hover:text-white transition-all duration-300 rounded-xl disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating...' : isLogin ? 'Sign In' : 'Register Account'}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
