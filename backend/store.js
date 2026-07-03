/**
 * Rentora: Shared In-Memory Data Store (No Database required!)
 * Passwords for all pre-populated test accounts are: "password123"
 */

// 1. Pre-populated users covering Admin, Owners, and Tenants
export let users = [
  {
    id: 1,
    name: "System Administrator",
    email: "admin@rentora.com",
    // Encrypted hash of the password "password123" generated via bcryptjs
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
  },
  {
    id: 5,
    name: "Tenant Priya",
    email: "priya@rentora.com",
    passwordHash: "$2a$10$tM.yF.NfBAt9f5V/nSTuWe.wY385xszYFfCqUaREI8tW6kYq6oYgq",
    role: "tenant"
  }
];

// 2. Pre-populated properties in neighborhoods of Salem, Tamil Nadu
export let properties = [
  {
    id: 101,
    ownerId: 2,
    title: "Luxury 2 BHK Apartment in Salem",
    location: "Fairlands, Salem",
    price: 15000,
    bhk: 2,
    propertyType: "Apartment",
    status: "Approved" // Approved listings are immediately searchable publicly
  },
  {
    id: 102,
    ownerId: 2,
    title: "Cozy 1 BHK Independent House",
    location: "Meyyanur, Salem",
    price: 12000,
    bhk: 1,
    propertyType: "House",
    status: "Pending" // Awaiting Admin approval before showing publicly
  },
  {
    id: 103,
    ownerId: 3,
    title: "Premium 3 BHK Villa with Garden",
    location: "Alagapuram, Salem",
    price: 28000,
    bhk: 3,
    propertyType: "Villa",
    status: "Approved"
  },
  {
    id: 104,
    ownerId: 3,
    title: "Modern Studio Apartment near Bus Stand",
    location: "Hasthampatti, Salem",
    price: 8500,
    bhk: 1,
    propertyType: "Apartment",
    status: "Approved"
  }
];

// 3. Rental application requests connecting tenants to properties
export let rentalRequests = [
  {
    id: 201,
    propertyId: 101,
    tenantId: 4,
    tenantName: "Tenant Afrin",
    status: "Pending" // Options: 'Pending', 'Accepted', 'Rejected'
  },
  {
    id: 202,
    propertyId: 103,
    tenantId: 5,
    tenantName: "Tenant Priya",
    status: "Accepted" // Accepted applications trigger payments & billing cycles
  }
];

// 4. Rent billing invoices and transaction summaries
export let payments = [
  {
    id: 301,
    propertyId: 101,
    tenantId: 4,
    amount: 15000,
    status: "Unpaid", // Options: 'Unpaid' or 'Paid'
    dueDate: "2026-08-10",
    paidDate: null
  },
  {
    id: 302,
    propertyId: 103,
    tenantId: 5,
    amount: 28000,
    status: "Paid",
    dueDate: "2026-07-01",
    paidDate: "2026-06-29T10:15:30.000Z" // ISO timestamp for transaction logs
  }
];

// 5. Maintenance tickets filed by active tenants for facility issues
export let maintenanceIssues = [
  {
    id: 401,
    propertyId: 101,
    tenantId: 4,
    issueDescription: "Water leakage from the bathroom washbasin pipes.",
    priority: "High", // Options: 'Low', 'Medium', 'High'
    status: "Submitted" // Options: 'Submitted', 'In Progress', 'Resolved'
  },
  {
    id: 402,
    propertyId: 103,
    tenantId: 5,
    issueDescription: "A/C unit in master bedroom is blowing warm air.",
    priority: "Medium",
    status: "In Progress"
  }
];