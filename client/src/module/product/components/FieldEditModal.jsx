import { X } from "lucide-react";
import { useState } from "react";
import { Textarea } from "../../../components/ui/textarea";

const FloatingInput = ({ value, onChange, placeholder, type = "text", prefix, max, suffixIcon, suffixAction, isGenerating }) => {
  const isActive = value !== undefined && value !== "";
  
  return (
    <div className="relative w-full">
      {isActive && (
        <label className="absolute -top-2 left-3 text-[11px] font-medium px-1 bg-white text-[#0052ff] z-10 transition-all">
          {placeholder}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5b616e] font-medium">
            {prefix}
          </div>
        )}
        <input
          type={type}
          min={type === "number" ? "0" : undefined}
          max={max}
          placeholder={!isActive ? placeholder : ""}
          value={value}
          autoFocus
          onKeyDown={(e) => {
            if (type === "number" && (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+")) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            let val = e.target.value;
            if (type === "number" && val !== "") {
              if (parseFloat(val) < 0) val = "0";
              if (max !== undefined && parseFloat(val) > max) val = max.toString();
            }
            onChange(val);
          }}
          onBlur={(e) => {
            let val = e.target.value;
            if (type === "number" && val !== "") {
              if (parseFloat(val) < 0) val = "0";
              if (max !== undefined && parseFloat(val) > max) val = max.toString();
              onChange(val);
            }
          }}
          className={`w-full h-[48px] rounded-[12px] text-[14px] outline-none transition-all ${
            isActive ? "border-[#0052ff] bg-white" : "border-transparent bg-[#eef0f3]"
          }`}
          style={{
            paddingLeft: prefix ? "32px" : "16px",
            paddingRight: suffixIcon ? "48px" : "16px",
            border: isActive ? "1px solid #0052ff" : "1px solid transparent",
            color: "#0a0b0d",
          }}
        />
        {suffixIcon && (
          <button 
            onClick={suffixAction} 
            disabled={isGenerating}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#0052ff] hover:text-[#003ecc] ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {suffixIcon}
          </button>
        )}
      </div>
    </div>
  );
};

export default function FieldEditModal({ title, placeholder, initialValue = "", onSave, onClose, type = "text" }) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
        <h2 className="text-[18px] font-bold text-[#0a0b0d]">
          {title}
        </h2>
        <button onClick={onClose} className="cursor-pointer transition-colors text-[#5b616e] hover:text-[#0a0b0d]">
          <X className="size-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6 bg-[#f7f7f7]">
        <div>
           {type === "textarea" ? (
             <textarea
               value={value}
               onChange={(e) => setValue(e.target.value)}
               placeholder={placeholder}
               className="w-full min-h-[120px] rounded-[12px] p-4 text-[14px] outline-none transition-all border-none bg-[#eef0f3] text-[#0a0b0d] resize-none"
               autoFocus
             />
           ) : (
             <FloatingInput 
                value={value} 
                onChange={setValue} 
                placeholder={placeholder} 
                type={type} 
             />
           )}
           <p className="text-[12px] text-[#7c828a] mt-2 px-1">Enter the {title.toLowerCase()} for this product.</p>
        </div>
      </div>
      <div className="px-5 pb-6 pt-3 shrink-0 bg-white border-t border-[#dee1e6]">
        <button 
          onClick={() => onSave(value)}
          className="cursor-pointer w-full rounded-[100px] text-[16px] font-semibold text-white transition-all bg-[#0052ff] hover:bg-[#003ecc] h-14"
        >
          Save
        </button>
      </div>
    </div>
  );
}
