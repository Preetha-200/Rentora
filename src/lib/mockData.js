export const mockProperties = [
  {
    id: 'prop-101',
    title: 'Modern 2BHK Apartment',
    location: 'Meyyanur, Salem',
    price: 15000,
    status: 'Approved',
    type: 'Apartment',
    bhk: 2,
    amenities: ['Parking', 'Security', 'Power Backup'],
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
  },
  {
    id: 'prop-102',
    title: 'Cozy Studio Suite',
    location: 'Fairlands, Salem',
    price: 8500,
    status: 'Pending',
    type: 'Studio',
    bhk: 1,
    amenities: ['Wifi', 'Furnished'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
  },
  {
    id: 'prop-103',
    title: 'Luxury 3BHK Independent Villa',
    location: 'Hasthampatti, Salem',
    price: 32000,
    status: 'Approved',
    type: 'Villa',
    bhk: 3,
    amenities: ['Garden', 'Parking', 'Security', 'Gym'],
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=500'
  },
  {
    id: 'prop-104',
    title: 'Premium 2BHK Gated Flat',
    location: 'Alagapuram, Salem',
    price: 18000,
    status: 'Approved',
    type: 'Apartment',
    bhk: 2,
    amenities: ['Security', 'Power Backup', 'Lift'],
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
  },
  {
    id: 'prop-105',
    title: 'Affordable 1BHK House',
    location: 'Ammapet, Salem',
    price: 6000,
    status: 'Approved',
    type: 'Independent House',
    bhk: 1,
    amenities: ['Water Supply'],
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500'
  }
];

export const mockRequests = [
  {
    id: 'req-201',
    propertyName: 'Modern 2BHK Apartment',
    tenantName: 'John Doe',
    status: 'Pending',
    date: '2026-06-28'
  }
];

export const mockPayments = [
  {
    id: 'pay-301',
    propertyName: 'Modern 2BHK Apartment',
    amount: 15000,
    status: 'Paid',
    date: '2026-06-01'
  }
];

export const mockMaintenance = [
  {
    id: 'maint-401',
    propertyName: 'Cozy Studio Suite',
    issue: 'Plumbing leak in restroom',
    status: 'In Progress',
    priority: 'High'
  }
];