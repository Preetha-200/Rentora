import express from 'express';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';
import { payments, maintenanceIssues, properties } from '../store.js';

const router = express.Router();

// ==========================================
// 💳 PAYMENTS SYSTEM (RENT TRADING)
// ==========================================

// 1. Get outstanding bills (Tenant Only)
// Triggered on: Tenant Dashboard Load
router.get('/payments/my-bills', verifyToken, authorizeRoles('tenant'), (req, res) => {
  const myBills = payments.filter(p => p.tenantId === req.user.id);
  res.json(myBills);
});

// 2. Submit rent payment (Tenant Only)
// Triggered on: Clicking "Pay Rent" Button
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

// ==========================================
// 🔧 MAINTENANCE SYSTEM (FACILITY ISSUES)
// ==========================================

// 1. File maintenance report ticket (Tenant Only)
// Triggered on: Tenant submitting "Report Maintenance" form
router.post('/maintenance/report', verifyToken, authorizeRoles('tenant'), (req, res) => {
  try {
    const { propertyId, issueDescription, priority } = req.body;

    if (!propertyId || !issueDescription || !priority) {
      return res.status(400).json({ message: 'All inputs are required.' });
    }

    // Verify target property exists
    const propertyExists = properties.some(p => p.id === parseInt(propertyId));
    if (!propertyExists) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const newTicket = {
      id: maintenanceIssues.length + 401,
      propertyId: parseInt(propertyId),
      tenantId: req.user.id,
      issueDescription,
      priority, // 'Low', 'Medium', 'High'
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
// Triggered on: Landlord Dashboard Load
// Security Fix: Filters list so owners only see issues for properties they own
router.get('/maintenance/landlord-view', verifyToken, authorizeRoles('owner'), (req, res) => {
  const myPropertyIds = properties
    .filter(p => p.ownerId === req.user.id)
    .map(p => p.id);

  const myIssues = maintenanceIssues.filter(issue => 
    myPropertyIds.includes(issue.propertyId)
  );

  res.json(myIssues);
});

// 3. Update maintenance ticket status (Owner Only)
// Triggered on: Landlord changing status dropdown to 'In Progress' or 'Resolved'
// Security Fix: Validates that the updating owner owns the underlying property
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

  // Validate property ownership
  const associatedProperty = properties.find(p => p.id === ticket.propertyId);
  if (!associatedProperty || associatedProperty.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied. You do not own this property.' });
  }

  ticket.status = status;
  res.json({ message: `Maintenance ticket status updated successfully to: ${status}`, ticket });
});

export default router;