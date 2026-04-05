import mongoose from "mongoose";
import { ORDER_STATUS_CONFIRMED,ORDER_STATUS_DELIVERED,ORDER_STATUS_CANCELLED,ORDER_STATUS_PENDING,ORDER_STATUS_SHIPPED } from "../constants/orderStatus.js";

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, "Order tracking number is required"],
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  orderItems: [
    {
      artId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Art",
        required: [true, "Art ID is required"],
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  status: {
    type: String,
    enum: [
      ORDER_STATUS_PENDING,
      ORDER_STATUS_CONFIRMED,
      ORDER_STATUS_SHIPPED,
      ORDER_STATUS_DELIVERED,
      ORDER_STATUS_CANCELLED,
    ],
    default: ORDER_STATUS_PENDING,
  },
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
  },
  shippingAddress: {
    city: {
      type: String,
      required: [true, "City is required"],
    },
    Province: {
      type: String,
      required: [true, "Province is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      default: "Nepal",
    },
    street: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
  },
  estimatedDeliveryDate: {
    type: Date,
  },
  payment:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  }
});

const model = mongoose.model("Order", orderSchema);

export default model;
