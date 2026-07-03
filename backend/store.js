// A simple in-memory store for development
const properties = [
    { id: 1, title: 'Luxury Apartment', location: 'Downtown', price: 1500, status: 'Available' },
    { id: 2, title: 'Cozy Studio', location: 'Suburbs', price: 800, status: 'Rented' }
];

const users = [];
const requests = [];

export default {
    properties,
    users,
    requests
};