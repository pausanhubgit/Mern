import axios from "axios";
import config from "../config/index.js";

const payViaKhalti = async(data) => {
    if(!data) throw{message:"Payment data is required."};
    if(!data.amount) throw{message:"Amount is required."};
    if(!data.purchaseOrderId) throw{message:"Purchase order id is required."};
    if(!data.purchaseOrderName) throw{message:"Purchase order name is required."};
    if(!data.customer) throw{message: "Customer information is required."};
    if(!data.customer.email) throw{message: "Customer email is required."};
    const customerName = data.customer.name || data.customer.username || (data.customer.email ? data.customer.email.split('@')[0] : "");
    if(!customerName) throw{message: "Customer name is required."};
    const body = {
             return_url: config.khalti.returnUrl,
             amount: data.amount,
             website_url: config.appUrl,
             purchase_order_id: data.purchaseOrderId,
             purchase_order_name: data.purchaseOrderName,
             customer_info: {
                 name: customerName,
                 email: data.customer.email,
                 phone: data.customer.phone || "",
             },

    };
    const apiKey = config.khalti.apiKey;
    if(!apiKey) throw{message: "Khalti API Key is missing in security configuration."};
    
    console.log("Khalti request body:", JSON.stringify(body));
    console.log("Using Khalti Key starting with:", apiKey.substring(0, 4) + "****");

    try {
        const response = await axios.post(
            `${config.khalti.apiUrl}/epayment/initiate/`,
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Key ${apiKey}`,
                },
            }
        );
        console.log("Khalti response:", response.data);
        return response.data;
    } catch (error) {
        console.log("Khalti API Full Error Response:", JSON.stringify(error.response?.data));
        console.error("Khalti API Error Status:", error.response?.status);
        throw {
            statusCode: error.response?.status || 500,
            message:
                error.response?.data?.detail ||
                error.response?.data ||
                error.message ||
                "Payment initialization failed",
        };
    }


    // if(!data.purchaseOrderId) throw{message:"Purchase order id is required."};
    // if(!data.purchaseOrderName) throw{message:"Purchase order name is required."};
    // if(!data.customer) throw{message:"Customer information is required."};
    // if(!data.customer.email) throw{message:"Customer email is required."};

    // Khalti requires mobile number
//     const mobileNumber = data.customer.phone || "9800000000";



//     console.log("Khalti Payment Request Body:", JSON.stringify(body, null, 2));

//     try {
//         const response = await axios.post(
//             `${config.khalti.apiUrl}/epayment/initiate/`,
//             body,
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Key ${config.khalti.apiKey}`
//                 },
//             }
//         );
//         console.log("Khalti Payment Success:", response.data);
//         return response.data;
//     } catch(error) {
//         console.error("Khalti API Error Response:", error.response?.data);
//         console.error("Khalti API Error Status:", error.response?.status);
//         throw {
//             statusCode: error.response?.status || 500,
//             message: error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message || "Payment initialization failed"
//         };
//     }
// };
};

export default {payViaKhalti};