import express from 'express';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';
import { properties } from '../store.js';

const router = express.Router();

// Public: Browse properties on home/search feed
router.get('/', (req, res) => {
  const approved = properties.filter(p => p.status === 'Approved');
  res.json(approved);
});

// Owner: Post a new property listing
router.post('/add', verifyToken, authorizeRoles('owner'), (req, res) => {
  try {
    const { title, location, price, bhk, propertyType } = req.body;

    if (!title || !location || !price || !bhk || !propertyType) {
      return res.status(400).json({ message: 'All listing fields are required.' });
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
      message: 'Property listing submitted for Admin review.',
      property: newProperty
    });
  } catch (err) {
    res.status(500).json({ message: 'Error saving property.' });
  }
});

// Admin: Get unapproved listings
router.get('/pending', verifyToken, authorizeRoles('admin'), (req, res) => {
  const pending = properties.filter(p => p.status === 'Pending');
  res.json(pending);
});

// Admin: Approve a listing to go live
router.put('/approve/:id', verifyToken, authorizeRoles('admin'), (req, res) => {
  const propertyId = parseInt(req.params.id);
  const property = properties.find(p => p.id === propertyId);

  if (!property) {
    return res.status(404).json({ message: 'Property not found.' });
  }

  property.status = 'Approved';
  res.json({ message: 'Property approved successfully!', property });
});

export default router;