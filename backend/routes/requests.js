import express from 'express';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';
import { rentalRequests, properties, users } from '../store.js';

const router = express.Router();

// 1. Submit rental application (Tenant Only)
router.post('/apply', verifyToken, authorizeRoles('tenant'), (req, res) => {
  try {
    const { propertyId } = req.body;

    const property = properties.find(p => p.id === parseInt(propertyId));
    if (!property) {
      return res.status(404).json({ message: 'Property listing not found.' });
    }

    const tenantUser = users.find(u => u.id === req.user.id);

    const newRequest = {
      id: rentalRequests.length + 201,
      propertyId: parseInt(propertyId),
      tenantId: req.user.id,
      tenantName: tenantUser ? tenantUser.name : "Anonymous Tenant",
      status: 'Pending'
    };
    rentalRequests.push(newRequest);

    res.status(201).json({
      message: 'Application successfully sent to property owner.',
      request: newRequest
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// 2. View requests for owned properties (Owner Only)
router.get('/owner-requests', verifyToken, authorizeRoles('owner'), (req, res) => {
  const ownedPropertyIds = properties.filter(p => p.ownerId === req.user.id).map(p => p.id);
  const applications = rentalRequests.filter(req => ownedPropertyIds.includes(req.propertyId));
  res.json(applications);
});

// 3. Update request status (Owner Only)
router.put('/status/:id', verifyToken, authorizeRoles('owner'), (req, res) => {
  const requestId = parseInt(req.params.id);
  const { status } = req.body; // 'Accepted' or 'Rejected'

  if (!status || !['Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: "Status must be 'Accepted' or 'Rejected'." });
  }

  const application = rentalRequests.find(r => r.id === requestId);
  if (!application) {
    return res.status(404).json({ message: 'Rental request application not found.' });
  }

  application.status = status;
  res.json({ message: `Application status updated to: ${status}`, application });
});

export default router;
