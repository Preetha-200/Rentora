import express from 'express';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';
import { properties } from '../store.js';

const router = express.Router();

// 1. Get Approved Listings (Public Search)
router.get('/', (req, res) => {
  const approved = properties.filter(p => p.status === 'Approved');
  res.json(approved);
});

// 2. Submit a Property (Owners Only)
router.post('/add', verifyToken, authorizeRoles('owner'), (req, res) => {
  try {
    const { title, location, price, bhk, propertyType } = req.body;

    if (!title || !location || !price || !bhk || !propertyType) {
      return res.status(400).json({ message: 'All listing specifications are required.' });
    }

    const newProperty = {
      id: properties.length + 101,
      ownerId: req.user.id,
      title,
      location,
      price: Number(price),
      bhk: Number(bhk),
      propertyType,
      status: 'Pending'
    };
    properties.push(newProperty);

    res.status(201).json({
      message: 'Property listing logged successfully. Pending Admin review.',
      property: newProperty
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error saving listing.' });
  }
});

// 3. Get pending approvals (Admin Only)
router.get('/pending', verifyToken, authorizeRoles('admin'), (req, res) => {
  const pending = properties.filter(p => p.status === 'Pending');
  res.json(pending);
});

// 4. Approve Pending Property (Admin Only)
router.put('/approve/:id', verifyToken, authorizeRoles('admin'), (req, res) => {
  const propertyId = parseInt(req.params.id);
  const property = properties.find(p => p.id === propertyId);

  if (!property) {
    return res.status(404).json({ message: 'Property listing not found.' });
  }

  property.status = 'Approved';
  res.json({ message: `Property with ID ${propertyId} approved. Listing is now public!`, property });
});

export default router;