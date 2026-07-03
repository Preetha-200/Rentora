import express from 'express';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';
import { payments, maintenanceIssues } from '../store.js';

const router = express.Router();

router.get('/payments/my-bills', verifyToken, authorizeRoles('tenant'), (req, res) => {
  const myBills = payments.filter(p => p.tenantId === req.user.id);
  res.json(myBills);
});

// 2. Submit rent payment (Tenant Only)
router.put('/payments/:id/pay', verifyToken, authorizeRoles('tenant'), (req, res) => {
  const invoiceId = parseInt(req.params.id);
  const invoice = payments.find(p => p.id === invoiceId && p.tenantId === req.user.id);

  if (!invoice) {
    return res.status(404).json({ message: 'Rent invoice bill not found.' });
  }

  if (invoice.status === 'Paid') {
    return res.status(400).json({ message: 'This invoice bill has already been paid.' });
  }

  invoice.status = 'Paid';
  invoice.paidDate = new Date().toISOString();

  res.json({
    message: 'Rent payment transaction successfully completed!',
    invoice
  });
});

router.post('/maintenance/report', verifyToken, authorizeRoles('tenant'), (req, res) => {
  try {
    const { propertyId, issueDescription, priority } = req.body;

    if (!propertyId || !issueDescription || !priority) {
      return res.status(400).json({ message: 'All inputs are required.' });
    }

    const newTicket = {
      id: maintenanceIssues.length + 401,
      propertyId: parseInt(propertyId),
      tenantId: req.user.id,
      issueDescription,
      priority, // Low, Medium, High
      status: 'Submitted'
    };
    maintenanceIssues.push(newTicket);

    res.status(201).json({
      message: 'Maintenance ticket created successfully!',
      ticket: newTicket
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error filing ticket.' });
  }
});

// 2. View logged maintenance issues (Owner Only)
router.get('/maintenance/landlord-view', verifyToken, authorizeRoles('owner'), (req, res) => {
  res.json(maintenanceIssues);
});

// 3. Update maintenance ticket status (Owner Only)
router.put('/maintenance/:id/status', verifyToken, authorizeRoles('owner'), (req, res) => {
  const ticketId = parseInt(req.params.id);
  const { status } = req.body; // 'In Progress' or 'Resolved'

  if (!status || !['In Progress', 'Resolved'].includes(status)) {
    return res.status(400).json({ message: "Status must be 'In Progress' or 'Resolved'." });
  }

  const ticket = maintenanceIssues.find(t => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ message: 'Maintenance ticket not found.' });
  }

  ticket.status = status;
  res.json({ message: `Maintenance ticket status updated successfully to: ${status}`, ticket });
});

export default router;