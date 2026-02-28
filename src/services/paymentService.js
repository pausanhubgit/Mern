import Payment from "../models/PaymentModel.js";

const createPayment = async (amount, method) => {
    const transactionId = crypto.randomUUID();

   return await Payment.create({
        amount: amount,
        method,
        transactionId,
}    );
};

const updatePayment = async (id, method) => {
    return await Payment.findByIdAndUpdate(id, {
         method,
    });
}

export default { createPayment, updatePayment };