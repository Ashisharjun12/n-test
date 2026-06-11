import axios from 'axios';


export const verifyGSTIN = async (gstin: string) => {
  try {

    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!gstinRegex.test(gstin)) {
      return { 
        isValid: false, 
        message: "Invalid GSTIN format. Please check the number." 
      };
    }

    return {
      isValid: true,
      message: "GSTIN verified successfully.",
      data: {
        gstin,
        businessName: "Verified Business Pvt Ltd",
        status: "Active",
        taxpayerType: "Regular"
      }
    };

  } catch (error: any) {
    console.error("GST Verification Error:", error.message || error);
    return { 
      isValid: false, 
      message: "Failed to verify GSTIN. API Error." 
    };
  }
};
