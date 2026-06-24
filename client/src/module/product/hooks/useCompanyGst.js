import { useState, useEffect, useCallback } from "react";
import useCompanyStore from "../../../store/company.store";
import { normalizeGstin } from "../../../lib/gstUtils";

export function useCompanyGst() {
  const activeCompany = useCompanyStore((s) => s.activeCompany);
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);
  const updateCompanyInStore = useCompanyStore((s) => s.updateCompany);

  const gstin = activeCompany?.gst || "";
  const [gstVerified, setGstVerified] = useState(!!gstin.trim());

  useEffect(() => {
    setGstVerified(!!activeCompany?.gst?.trim());
  }, [activeCompany?._id, activeCompany?.gst]);

  const updateCompanyGst = useCallback(
    async (newGstin) => {
      if (!activeCompany?._id) {
        return { isValid: false, error: "No active company selected." };
      }

      const normalized = normalizeGstin(newGstin);
      if (!normalized) {
        return { isValid: false, error: "Please enter a GSTIN." };
      }

      try {
        const updated = await updateCompanyInStore(activeCompany._id, { gst: normalized });
        setActiveCompany(updated);
        setGstVerified(true);
        return { isValid: true, gstin: normalized };
      } catch (err) {
        return { isValid: false, error: err.message || "Failed to save GSTIN." };
      }
    },
    [activeCompany?._id, updateCompanyInStore, setActiveCompany]
  );

  return {
    gstin,
    gstVerified,
    updateCompanyGst,
  };
}
