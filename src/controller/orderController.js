import orderService from '../services/orderService.js';

const getOrders = async (req, res) => {
    try{
        const orders = await orderService.getOrders();
        res.status(200).json(orders);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

const getOrdersByUser = async (req, res) => {
  try {
    const data = await orderService.getOrderByUser(req.query,req.user._id);

    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
const getOrderById = async (req, res) => {
  try {
    const data = await orderService.getOrderById(req.params.id);

    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).send(error.message);
  }
};
const createOrder = async (req, res) => {
  const input = req.body;
  const userid = req.user._id;
  console.log(input);
  if (!input.orderItems || !input.orderItems.length) {
    return res.status(400).send("Order items are required.");
  }
  try {
    const data = await orderService.createOrder(input, userid);
    res.status(201).json({message: "Order created successfully", data});
  } catch (error) {
    res.status(500).json({message: error.message});
  } 
};
const updateOrder = async (req, res) => {
  try{
    const data = await orderService.updateOrder(req.params.id, req.body,req.user);
    res.json(data);
  } catch(error){
    res.status(500).json({message: error.message});
  }
};
    const deleteOrder = async (req, res) => {
    const id = req.params.id;
    try{
        await orderService.deleteOrder(id,req.user);
        res.status(200).json({message: "Order deleted successfully"});
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

const orderPaymentViaKhalti = async (req, res) => {
    const orderId = req.params.id;
    try{
      const data = await orderService.orderPaymentViaKhalti(orderId, req.user);
      res.json(data);
    } catch(error){
      res.status(error.statusCode || 500).send(error.message);
    }
};
const confirmOrderPayment = async (req, res) => {
    const orderId = req.params.id;
    const status = req.body.status;
    try{
      const data = await orderService.confirmOrderPayment(orderId, req.body.status, req.user);
      res.json(data);
    } catch(error){
      res.status(error.statusCode || 500).send(error.message);
    }
};
const getOrdersOfMerchant = async (req, res) => {
  try {
    const data = await orderService.getOrdersOfMerchant(req.user._id);
    res.json(data);
  }
    catch (error) {
      res.status(error.statusCode || 500).send(error.message);
    }
};

const markAsCOD = async (req, res) => {
    try {
        const data = await orderService.markAsCOD(req.params.id, req.user, req.body);
        res.json({ message: "Order marked for Cash on Delivery", data });
    } catch(error) {
        res.status(error.statusCode || 500).send(error.message);
    }
};

const cancelOrder = async (req, res) => {
    try {
        const data = await orderService.cancelOrder(req.params.id, req.user);
        res.json({ message: "Order cancelled successfully", data });
    } catch(error) {
        res.status(error.statusCode || 500).send(error.message);
    }
};

export default {getOrders, getOrdersOfMerchant,getOrdersByUser,getOrderById,createOrder,updateOrder,deleteOrder,orderPaymentViaKhalti,confirmOrderPayment, markAsCOD, cancelOrder}; 
