import api from "./api";

/** Reserved for future GST verification API */
export const gstApi = {
  verifyGstin: (gstin) => api.post("/gst/verify", { gstin }),
};
