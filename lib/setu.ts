import axios from "axios";

const SETU_BASE_URL = "https://fiu-sandbox.setu.co/v2"; // Sandbox URL

// These would normally be in .env


export const setuClient = {
    /**
     * Step 1: Create a consent request for the user
     */
    createConsentRequest: async (userId: string) => {
        try {
            console.log("Creating consent request for user:", userId);
            // In a real scenario, you'd use your actual keys. 
            // For sandbox, we follow the Setu AA Quickstart.
            const response = await axios.post(
                `${SETU_BASE_URL}/consents`,
                {
                    vua: "7218096768@onemoney", // Mandatory for v2 sandbox
                    consentDuration: {
                        unit: "MONTH",
                        value: 1
                    },
                    dataLife: {
                        unit: "YEAR",
                        value: 1
                    },
                    fetchType: "PERIODIC",
                    frequency: {
                        unit: "DAY",
                        value: 1
                    },
                    dataRange: {
                        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
                        to: new Date().toISOString()
                    },
                    consentMode: "STORE",
                    consentTypes: ["TRANSACTIONS", "PROFILE", "SUMMARY"],
                    fiTypes: ["DEPOSIT"],
                    purpose: {
                        code: "101",
                        text: "Personal Finance Management",
                        category: {
                            "type": "deposit",
                        },
                        refUri: "https://api.rebit.org.in/aa/purpose/101.xml"
                    },
                    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/bank/callback`,
                    context: [
                        { key: "accounttype", value: "SAVINGS" },
                        { key: "purposeCode", value: "101" }
                    ]
                },
                {
                    headers: {
                        "x-client-id": process.env.SETU_CLIENT_ID,
                        "x-client-secret": process.env.SETU_CLIENT_SECRET,
                        "x-product-instance-id": process.env.SETU_PRODUCT_INSTANCE_ID,
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error("Setu Consent Error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Get details of a consent (to check FIDataRange)
     */
    getConsentStatus: async (consentId: string) => {
        try {
            const response = await axios.get(
                `${SETU_BASE_URL}/consents/${consentId}`,
                {
                    headers: {
                        "x-client-id": process.env.SETU_CLIENT_ID,
                        "x-client-secret": process.env.SETU_CLIENT_SECRET,
                        "x-product-instance-id": process.env.SETU_PRODUCT_INSTANCE_ID,
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error("Setu Status Error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Step 2: Fetch data after consent is approved
     */
    fetchFinancialData: async (consentId: string) => {
        try {
            // Use a helper to format dates without milliseconds (some APIs are picky)
            const formatDate = (date: Date) => date.toISOString().split(".")[0] + "Z";

            // To be absolutely safe, we'll ask for data starting 1 day AFTER the 
            // authorized start date, ensuring we are strictly within the FIDataRange.
            const from = formatDate(new Date(Date.now() - 364 * 24 * 60 * 60 * 1000)); // 364 days ago (safe subset of 365)
            const to = formatDate(new Date(Date.now() - 60 * 60 * 1000)); // 1 hour ago

            const sessionResponse = await axios.post(
                `${SETU_BASE_URL}/sessions`,
                {
                    consentId,
                    dataRange: { from, to },
                    format: "json"
                },
                {
                    headers: {
                        "x-client-id": process.env.SETU_CLIENT_ID,
                        "x-client-secret": process.env.SETU_CLIENT_SECRET,
                        "x-product-instance-id": process.env.SETU_PRODUCT_INSTANCE_ID,
                    }
                }
            );

            return sessionResponse.data;
        } catch (error: any) {
            console.error("Setu Session Error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Step 3: Get the actual data from the session
     * In a production app, you'd poll this until status is 'COMPLETED'
     */
    getSessionData: async (sessionId: string) => {
        try {
            const response = await axios.get(
                `${SETU_BASE_URL}/sessions/${sessionId}`,
                {
                    headers: {
                        "x-client-id": process.env.SETU_CLIENT_ID,
                        "x-client-secret": process.env.SETU_CLIENT_SECRET,
                        "x-product-instance-id": process.env.SETU_PRODUCT_INSTANCE_ID,
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error("Setu Data Error:", error.response?.data || error.message);
            throw error;
        }
    }
};
