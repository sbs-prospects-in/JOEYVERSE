import React, { useState } from 'react';
import { Phone, ChevronDown } from 'lucide-react';

export default function CountryPhoneInput({ id, placeholder = "9876543210", required = false, defaultValue = "", onChange, className = "" }) {
  // Extract initial country code and number if defaultValue is provided (e.g. "+919876543210")
  const getInitialState = () => {
    if (!defaultValue) return { code: '+91', number: '' };
    const match = defaultValue.match(/^(\+\d{1,4})(\d{10})$/);
    if (match) return { code: match[1], number: match[2] };
    // fallback if it doesn't strictly match a known prefix + 10 digits
    return { code: '+91', number: defaultValue.replace(/\D/g, '').slice(-10) };
  };
  
  const initialState = getInitialState();
  const [countryCode, setCountryCode] = useState(initialState.code);
  const [phoneNumber, setPhoneNumber] = useState(initialState.number);

  // The final combined value e.g. +919876543210
  const combinedValue = phoneNumber ? `${countryCode}${phoneNumber}` : "";

  const handlePhoneInput = (e) => {
    // Only allow digits, max 10
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(digitsOnly);
    if (onChange) {
      onChange(digitsOnly ? `${countryCode}${digitsOnly}` : "");
    }
  };

  const handleCodeChange = (e) => {
    setCountryCode(e.target.value);
    if (onChange && phoneNumber) {
      onChange(`${e.target.value}${phoneNumber}`);
    }
  };

  return (
    <div className={`relative flex items-stretch ${className}`}>
      {/* Hidden input to maintain compatibility with uncontrolled forms using e.target.id.value */}
      <input type="hidden" id={id} name={id} value={combinedValue} />
      
      <div className="relative flex items-center bg-slate-100/50 border border-slate-200/80 rounded-l-xl border-r-0 focus-within:border-[#f2687c] transition-all">
        <select 
          value={countryCode}
          onChange={handleCodeChange}
          className="appearance-none bg-transparent pl-3 pr-7 py-3 outline-none text-sm font-semibold text-slate-700 cursor-pointer h-full z-10 relative"
        >
          <option value="+91">🇮🇳 +91</option>
          <option value="+1">🇺🇸 +1</option>
          <option value="+44">🇬🇧 +44</option>
          <option value="+61">🇦🇺 +61</option>
          <option value="+81">🇯🇵 +81</option>
          <option value="+49">🇩🇪 +49</option>
          <option value="+33">🇫🇷 +33</option>
          <option value="+86">🇨🇳 +86</option>
          <option value="+55">🇧🇷 +55</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>

      <div className="relative flex-grow">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="tel" 
          value={phoneNumber}
          onChange={handlePhoneInput}
          placeholder={placeholder}
          maxLength={10}
          pattern="[0-9]{10}"
          title="Phone number must be exactly 10 digits."
          className="w-full bg-white/40 border border-slate-200/80 focus:border-[#f2687c] focus:bg-white pl-9 pr-4 py-3 rounded-r-xl outline-none transition-all text-sm text-slate-700 shadow-sm h-full"
          required={required}
        />
      </div>
    </div>
  );
}
