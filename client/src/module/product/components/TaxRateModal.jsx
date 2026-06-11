import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const TAX_CATEGORIES = [
  {
    title: "STANDARD TAX RATES",
    rates: [0, 5, 18, 40]
  },
  {
    title: "OTHER TAXES",
    rates: [0.25, 1, 1.5, 3, 7.5, 6]
  },
  {
    title: "DEPRECATED TAXES",
    rates: [12, 28] // Keeping 12 and 28 here as per the design screenshots, but these are standard in India.
  }
];

export default function TaxRateModal({ onClose, onSelect, currentRate }) {
  const [openSection, setOpenSection] = useState("STANDARD TAX RATES");

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-in slide-in-from-bottom duration-300 h-[100dvh]">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid #dee1e6" }}>
        <h2 className="text-[18px] font-bold text-[#0a0b0d]">
          Select Tax
        </h2>
        <button onClick={onClose} className="cursor-pointer transition-colors text-[#5b616e] hover:text-[#0a0b0d]">
          <X className="size-6" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-20 flex flex-col gap-3 bg-[#f7f7f7]">
        {TAX_CATEGORIES.map((category) => {
          const isOpen = openSection === category.title;
          return (
            <div key={category.title} className="flex flex-col bg-white rounded-[16px] overflow-hidden" style={{ border: "1px solid #dee1e6" }}>
              <button 
                onClick={() => setOpenSection(isOpen ? null : category.title)}
                className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-[#f7f7f7] transition-colors"
              >
                <span className="text-[12px] font-bold text-[#7c828a] tracking-wider">{category.title}</span>
                {isOpen ? <ChevronUp className="size-5 text-[#7c828a]" /> : <ChevronDown className="size-5 text-[#7c828a]" />}
              </button>
              
              {isOpen && (
                <div className="flex flex-col px-4 pb-2 max-h-[300px] overflow-y-auto">
                  {category.rates.map((rate, index) => {
                    const cgst = rate / 2;
                    const sgst = rate / 2;
                    const igst = rate;
                    const isSelected = parseFloat(currentRate) === rate;

                    return (
                      <div key={rate}>
                        <button
                          onClick={() => {
                            onSelect(rate.toString());
                            onClose();
                          }}
                          className="flex items-center justify-between py-4 w-full text-left cursor-pointer group"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-[16px] font-semibold text-[#0a0b0d]">{rate}%</span>
                            <span className="text-[12px] text-[#7c828a]">
                              ({cgst}% CGST & {sgst}% SGST, {igst}% IGST)
                            </span>
                          </div>
                          
                          <div className={`size-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'border-2 border-[#0052ff]' : 'border-2 border-[#dee1e6] group-hover:border-[#0052ff]'}`}>
                            {isSelected && <div className="size-3 rounded-full bg-[#0052ff]" />}
                          </div>
                        </button>
                        {index < category.rates.length - 1 && (
                          <div className="h-[1px] bg-[#eef0f3] w-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
