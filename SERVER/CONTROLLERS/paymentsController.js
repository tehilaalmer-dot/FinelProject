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
    },
    async getCollectionStatus(req, res) {
        try {
            const { buildingId, paymentMonth } = req.params;
            const status = await Payment.getCollectionStatus(buildingId, paymentMonth);
            res.json(status);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    async getExpenseCollectionStatus(req, res) {
        try {
            const { expenseId } = req.params;
            if (!expenseId) return res.status(400).json({ message: 'Missing expenseId' });

            const rows = await Payment.getExpenseCollectionStatus(expenseId);
            res.json(rows);
        } catch (error) {
            // If DB missing column expense_id, give helpful message
            if (error && error.sqlMessage && error.sqlMessage.includes('Unknown column')) {
                console.warn('payments table missing expense_id column — returning empty collection list');
                return res.status(200).json([]);
            }
            res.status(500).json({ message: error.message });
        }
    },
    async markPaymentPaid(req, res) {
        try {
            const { user_id, building_id, amount, payment_month, payment_method, expense_id } = req.body;

            // Validate: if expense_id provided, payment_month is not required
            if (!user_id || !building_id || !amount || !payment_method || (!payment_month && !expense_id)) {
                return res.status(400).json({ message: 'נא לספק user_id, building_id, amount ו-payment_method, וכן payment_month או expense_id' });
            }

            await Payment.createOrUpdatePayment({ user_id, building_id, amount, payment_month: payment_month || null, expense_id: expense_id || null, status: 'paid', payment_method });
            res.status(200).json({ message: 'התשלום סומן כשולם' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    ,
    async payExpense(req, res) {
        try {
            const { expense_id, amount, payment_method } = req.body;
            const requester = req.user;

            if (!expense_id || !amount || !payment_method) {
                return res.status(400).json({ message: 'נא לספק expense_id, amount ו-payment_method' });
            }

            // בקשת תשלום מיועדת על ידי המשתמש המחובר
            const user_id = requester.id;
            const building_id = requester.building_id;

            await Payment.createOrUpdatePayment({ user_id, building_id, expense_id, amount, payment_month: null, status: 'paid', payment_method });

            res.status(200).json({ message: 'התשלום בוצע בהצלחה', expense_id, user_id });
        } catch (error) {
            console.error('payExpense error', error);
            res.status(500).json({ message: error.message });
        }
    }
    ,
    async getUserExpenseStatus(req, res) {
        try {
            const { expenseId } = req.params;
            const requester = req.user;
            if (!expenseId) return res.status(400).json({ message: 'Missing expenseId' });

            const statusRow = await Payment.getPaymentForUserExpense(requester.id, expenseId);
            if (!statusRow) return res.status(200).json({ status: 'unpaid' });
            return res.status(200).json({ status: statusRow.status || 'unpaid', amount: statusRow.amount || 0 });
        } catch (error) {
            console.error('getUserExpenseStatus error', error);
            res.status(500).json({ message: error.message });
        }
    }
};

export default paymentsController;