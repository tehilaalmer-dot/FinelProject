import Payment from '../models/paymentModel.js';

const paymentsController = {
    async getBuildingPayments(req, res) {
        try {
            const payments = await Payment.getByBuildingId(req.params.building_id);
            res.json(payments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    async getUserPayments(req, res) {
        try {
            const payments = await Payment.getByUserId(req.params.user_id);
            res.json(payments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default paymentsController;