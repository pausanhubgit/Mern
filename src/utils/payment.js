import axios from "axios";
import config from "../config/index.js";
import Stripe from "stripe";

const payViaKhalti = async (data) => {
  if (!data) throw { statusCode: 400, message: "Payment data is required." };
  if (!data.amount) throw { statusCode: 400, message: "Amount is required." };
  if (!data.purchaseOrderId) throw { statusCode: 400, message: "Purchase order id is required." };
  if (!data.purchaseOrderName) throw { statusCode: 400, message: "Purchase order name is required." };
  if (!data.customer) throw { statusCode: 400, message: "Customer information is required." };
  
  const customerName = data.customer.name || data.customer.username || (data.customer.email ? data.customer.email.split('@')[0] : "Customer");
  const customerEmail = data.customer.email || "no-email@khalti.com";

  const body = {
    return_url: data.return_url || config.khalti.returnUrl || `${config.appUrl}/khalti/payment`,
    website_url: data.website_url || config.appUrl,
    amount: parseInt(data.amount),
    purchase_order_id: String(data.purchaseOrderId || ""),
    purchase_order_name: String(data.purchaseOrderName || ""),
    customer_info: {
      name: customerName,
      email: customerEmail,
      phone: data.customer.phone || "9800000001",
    },
  };

  const apiKey = (config.khalti.apiKey || "").trim();
  if (!apiKey) throw { statusCode: 500, message: "Khalti API Secret Key is missing. Please check your .env file." };

  // Always use a.khalti.com for Khalti ePayment v2 to prevent Vercel IP geo-blocks from dev.khalti.com
  let apiUrl = (config.khalti.apiUrl || "https://a.khalti.com/api/v2").trim();
  if (apiUrl.includes("dev.khalti.com")) {
      apiUrl = "https://a.khalti.com/api/v2";
  }

  console.log("[Khalti Initiation] Starting request for Order:", data.purchaseOrderName);
  console.log("DEBUG: Using API URL:", apiUrl, "Key length:", apiKey.length, "Key starts with:", apiKey.substring(0, 5));
  
  try {
    const response = await axios.post(
      `${apiUrl}/epayment/initiate/`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${apiKey}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    console.error("[Khalti API Error]:", JSON.stringify(errorData || error.message, null, 2));
    
    throw {
      statusCode: error.response?.status || 500,
      message: errorData?.detail || errorData?.message || "Khalti payment initiation failed. Please verify your keys and environment.",
    };
  }
};


const payViaStripe = async (data) => {
  if (!data) throw { message: "Payment data is required." };
  if (!data.amount) throw { message: "Amount is required." };

  const stripe = new Stripe(config.stripe.secretKey);

  // Convert NPR to USD for Stripe (approx rate: 1 USD = 135 NPR)
  // Stripe requires amount in smallest unit (cents), and does not support NPR
  const amountInUSD = Math.round((data.amount / 135) * 100); // paisa -> NPR -> cents

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInUSD || 100, // minimum 100 cents = $1 USD as fallback
    currency: "usd",
    // payment_method_types must be ['card'] when using Stripe Elements (CardElement)
    payment_method_types: ["card"],
    metadata: {
      customerName: data.customer?.name || data.customer?.username || "",
      customerEmail: data.customer?.email || "",
      customerPhone: data.customer?.phone || "",
      OrderId: data.orderId || "",
      OrderName: data.orderName || "",
      originalAmountNPR: String(data.amount || 0),
    }
  });
  return paymentIntent;
};

export default { payViaKhalti, payViaStripe };