

export let users = [
  {
    id: 1,
    name: "System Administrator",
    email: "admin@rentora.com",
    passwordHash: "$2a$10$tM.yF.NfBAt9f5V/nSTuWe.wY385xszYFfCqUaREI8tW6kYq6oYgq", 
    role: "admin"
  },
  {
    id: 2,
    name: "Property Owner John",
    email: "owner@rentora.com",
    passwordHash: "$2a$10$tM.yF.NfBAt9f5V/nSTuWe.wY385xszYFfCqUaREI8tW6kYq6oYgq",
    role: "owner"
  },
  {
    id: 3,
    name: "Landlord Kumar",
    email: "kumar@rentora.com",
    passwordHash: "$2a$10$tM.yF.NfBAt9f5V/nSTuWe.wY385xszYFfCqUaREI8tW6kYq6oYgq",
    role: "owner"
  },
  {
    id: 4,
    name: "Tenant Afrin",
    email: "tenant@rentora.com",
    passwordHash: "$2a$10$tM.yF.NfBAt9f5V/nSTuWe.wY385xszYFfCqUaREI8tW6kYq6oYgq",
    role: "tenant"
  }
];

export let properties = [
  {
    id: 101,
    ownerId: 2,
    title: "Luxury 2 BHK Apartment in Fairlands",
    location: "Fairlands, Salem",
    price: 15000,
    bhk: 2,
    propertyType: "Apartment",
    status: "Approved"
  },
  {
    id: 102,
    ownerId: 2,
    title: "Cozy 1 BHK Independent House",
    location: "Meyyanur, Salem",
    price: 12000,
    bhk: 1,
    propertyType: "House",
    status: "Pending"
  },
  {
    id: 103,
    ownerId: 3,
    title: "Premium 3 BHK Villa with Private Garden",
    location: "Alagapuram, Salem",
    price: 28000,
    bhk: 3,
    propertyType: "Villa",
    status: "Approved"
  }
];

export let rentalRequests = [
  {
    id: 201,
    propertyId: 101,
    tenantId: 4,
    tenantName: "Tenant Afrin",
    status: "Pending"
  }
];

export let payments = [
  {
    id: 301,
    propertyId: 101,
    tenantId: 4,
    amount: 15000,
    status: "Unpaid",
    dueDate: "2026-08-10",
    paidDate: null
  }
];

export let maintenanceIssues = [
  {
    id: 401,
    propertyId: 101,
    tenantId: 4,
    issueDescription: "Slight water leakage underneath the master bathroom pipeline.",
    priority: "High",
    status: "Submitted"
  }
];