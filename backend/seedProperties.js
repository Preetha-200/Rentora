const { db } = require("./config/firebase");
const { v4: uuidv4 } = require("uuid");
const OWNER_EMAIL = "owner@example.com";

async function seedProperties() {
  try {
    const userSnapshot = await db.collection("users").where("email", "==", OWNER_EMAIL).get();
    if (userSnapshot.empty) {
      console.error(`❌ No user found with email: ${OWNER_EMAIL}`);
      console.log("Please register an owner first, then update the OWNER_EMAIL variable.");
      return;
    }

    const ownerDoc = userSnapshot.docs[0];
    const ownerId = ownerDoc.id;

    const dummyProperties = [
      {
        title: "Spacious 3BHK Apartment",
        description: "A modern apartment with great city views, close to metro and shopping.",
        address: "123 Main Street, Downtown",
        city: "Mumbai",
        rent: 25000,
        bedrooms: 3,
        bathrooms: 2,
        furnishing: "fully-furnished",
        amenities: ["WiFi", "Parking", "AC", "Gym", "Swimming Pool"],
        ownerId: ownerId,
        status: "available",
        images: [
          "https://via.placeholder.com/400x300?text=Apartment+1",
          "https://via.placeholder.com/400x300?text=Apartment+1+Kitchen",
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: "Cozy 2BHK for Rent",
        description: "Quiet neighborhood, close to schools and parks. Ideal for small families.",
        address: "456 Green Avenue, Sector 12",
        city: "Delhi",
        rent: 18000,
        bedrooms: 2,
        bathrooms: 1,
        furnishing: "semi-furnished",
        amenities: ["WiFi", "Parking", "Balcony"],
        ownerId: ownerId,
        status: "available",
        images: [
          "https://via.placeholder.com/400x300?text=Apartment+2",
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: "Luxury Penthouse 4BHK",
        description: "High-end penthouse with panoramic views, private terrace, and premium amenities.",
        address: "789 Skyline Drive, Hilltop",
        city: "Bangalore",
        rent: 45000,
        bedrooms: 4,
        bathrooms: 3,
        furnishing: "fully-furnished",
        amenities: ["WiFi", "Parking", "AC", "Gym", "Swimming Pool", "Jacuzzi", "Security"],
        ownerId: ownerId,
        status: "available",
        images: [
          "https://via.placeholder.com/400x300?text=Penthouse+1",
          "https://via.placeholder.com/400x300?text=Penthouse+2",
          "https://via.placeholder.com/400x300?text=Penthouse+3",
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const batch = db.batch();
    for (const prop of dummyProperties) {
      const docRef = db.collection("properties").doc();
      batch.set(docRef, prop);
    }

    await batch.commit();
    console.log(`✅ Successfully seeded ${dummyProperties.length} dummy properties for owner: ${OWNER_EMAIL}`);
  } catch (error) {
    console.error("Seeding error:", error);
  }
}

seedProperties();