import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import banksData from "../data/banks.json";
import { Landmark, Banknote, CheckCircle2, CreditCard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const bankIcon = (type) => {
  if (type === "cash") return <Banknote className="size-4" style={{ color: "#05b169" }} />;
  return <Landmark className="size-4" style={{ color: "#0052ff" }} />;
};

export default function Banks({ selectedBank, onSelect }) {
  const [open, setOpen] = useState(false);
  const current = selectedBank || banksData[0];

  const handleSelect = (bank) => {
    onSelect(bank);
    setOpen(false);
  };

  return (
    <>
      {/* Inline Bank Row — inside CreateQuotation optional section */}
      <div className="flex items-center justify-between py-2 rounded-[16px]">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full flex items-center justify-center" style={{ background: "#eef0f3" }}>
            {bankIcon(current.type)}
          </div>
          <div>
            <p className="text-[12px] font-medium" style={{ color: "#5b616e" }}>Bank</p>
            <p className="text-[14px] font-semibold" style={{ color: "#0a0b0d" }}>{current.name}</p>
            {current.type === "bank" && (
              <p className="text-[12px] font-medium" style={{ color: "#7c828a", fontFamily: "'JetBrains Mono', monospace" }}>
                ••••{current.accountNumber.slice(-4)}
              </p>
            )}
          </div>
        </div>
        <button className="cursor-pointer text-[13px] font-semibold transition-colors" style={{ color: "#0052ff" }} onClick={() => setOpen(true)}>
          Change
        </button>
      </div>

      {/* Sheet for selecting bank */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-[24px] max-h-[75vh] overflow-y-auto p-0 border-0" style={{ background: "#ffffff", boxShadow: "0 -4px 32px rgba(0,0,0,0.08)" }}>
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: "#dee1e6" }} />
          </div>
          <div className="px-5 pt-2 pb-4" style={{ borderBottom: "1px solid #dee1e6" }}>
            <h2 className="text-[16px] font-semibold" style={{ color: "#0a0b0d" }}>Select Payment Method</h2>
          </div>

          <div className="px-5 py-4 flex flex-col gap-2">
            {banksData.map((bank) => {
              const isSelected = current.id === bank.id;
              return (
                <button
                  key={bank.id}
                  onClick={() => handleSelect(bank)}
                  className="flex items-center justify-between w-full p-3.5 rounded-[16px] transition-all text-left cursor-pointer"
                  style={{ border: `1px solid ${isSelected ? "#0052ff44" : "#dee1e6"}`, background: isSelected ? "#0052ff08" : "#ffffff" }}
                  onMouseEnter={e => !isSelected && (e.currentTarget.style.background = "#f7f7f7")}
                  onMouseLeave={e => !isSelected && (e.currentTarget.style.background = "#ffffff")}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full flex items-center justify-center" style={{ background: "#eef0f3" }}>
                      {bankIcon(bank.type)}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: "#0a0b0d" }}>{bank.name}</p>
                      {bank.type === "bank" ? (
                        <p className="text-[12px]" style={{ color: "#5b616e" }}>
                          {bank.bankName} · <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>••••{bank.accountNumber.slice(-4)}</span>
                        </p>
                      ) : (
                        <p className="text-[12px]" style={{ color: "#5b616e" }}>Default payment method</p>
                      )}
                      {bank.upiId && (
                        <p className="text-[12px] flex items-center gap-1 mt-0.5" style={{ color: "#5b616e" }}>
                          <CreditCard className="size-3" />
                          {bank.upiId}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="size-5 shrink-0" style={{ color: "#0052ff" }} />
                  ) : (
                    <ChevronRight className="size-4 shrink-0" style={{ color: "#a8acb3" }} />
                  )}
                </button>
              );
            })}

            {/* Add New Bank */}
            <button className="w-full mt-2 flex items-center justify-center gap-2 p-3.5 rounded-[16px] transition-all cursor-pointer"
              style={{ border: "1px dashed #dee1e6", background: "#ffffff", color: "#5b616e" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f7f7f7"}
              onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}>
              <Landmark className="size-4" />
              <span className="text-[14px] font-medium">Add New Bank Account</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
