const Property = require("../models/Property");
const { db } = require("../config/firebase");

async function createDefaultPropertiesForOwner(ownerId) {
  console.log(`🌱 Seeding default properties for owner: ${ownerId}`);
  const defaultProps = [
    {
      title: "Spacious 3BHK Apartment",
      description: "A modern apartment with great city views.",
      address: "123 Main Street, Downtown",
      city: "Mumbai",
      rent: 25000,
      bedrooms: 3,
      bathrooms: 2,
      furnishing: "fully-furnished",
      amenities: ["WiFi", "Parking", "AC", "Gym"],
      ownerId,
      status: "available",
      images: ["https://via.placeholder.com/400x300?text=Apartment+1"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Cozy 2BHK for Rent",
      description: "Quiet neighborhood, close to schools.",
      address: "456 Green Avenue, Sector 12",
      city: "Delhi",
      rent: 18000,
      bedrooms: 2,
      bathrooms: 1,
      furnishing: "semi-furnished",
      amenities: ["WiFi", "Parking", "Balcony"],
      ownerId,
      status: "available",
      images: ["https://via.placeholder.com/400x300?text=Apartment+2"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Luxury Penthouse 4BHK",
      description: "High-end penthouse with panoramic views.",
      address: "789 Skyline Drive, Hilltop",
      city: "Bangalore",
      rent: 45000,
      bedrooms: 4,
      bathrooms: 3,
      furnishing: "fully-furnished",
      amenities: ["WiFi", "Parking", "AC", "Gym", "Pool"],
      ownerId,
      status: "available",
      images: ["https://via.placeholder.com/400x300?text=Penthouse"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const batch = db.batch();
  for (const prop of defaultProps) {
    const docRef = db.collection("properties").doc();
    batch.set(docRef, prop);
  }
  await batch.commit();
  console.log(`✅ Seeded ${defaultProps.length} properties`);
}

exports.addProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      city,
      rent,
      bedrooms,
      bathrooms,
      furnishing,
      amenities,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const ownerId = req.user.id;
    const propertyData = {
      title,
      description,
      address,
      city,
      rent: Number(rent),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      furnishing,
      amenities: amenities ? amenities.split(",").map((a) => a.trim()) : [],
      ownerId,
      status: "available",
      images: [],
    };

    const newProperty = await Property.createProperty(propertyData);
    const imageUrls = await Property.uploadImages(req.files, newProperty.id);
    await Property.updateProperty(newProperty.id, { images: imageUrls });

    const updated = await Property.getPropertyById(newProperty.id);
    res.status(201).json(updated);
  } catch (error) {
    console.error("Add property error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};
    const properties = await Property.getAllProperties(filters);
    res.json(properties);
  } catch (error) {
    console.error("Get all properties error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const ownerId = req.user.id;
    console.log("🔍 Owner ID from token:", ownerId);
    let properties = await Property.getPropertiesByOwner(ownerId);

    if (properties.length === 0) {
      await createDefaultPropertiesForOwner(ownerId);
      properties = await Property.getPropertiesByOwner(ownerId);
    }

    res.json(properties);
  } catch (error) {
    console.error("Get my properties error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.getPropertyById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (error) {
    console.error("Get property error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.getPropertyById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    if (property.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updateData = { ...req.body };
    if (updateData.rent) updateData.rent = Number(updateData.rent);
    if (updateData.bedrooms) updateData.bedrooms = Number(updateData.bedrooms);
    if (updateData.bathrooms) updateData.bathrooms = Number(updateData.bathrooms);
    if (updateData.amenities) {
      updateData.amenities = updateData.amenities.split(",").map((a) => a.trim());
    }

    if (req.files && req.files.length > 0) {
      const newImages = await Property.uploadImages(req.files, id);
      const allImages = [...(property.images || []), ...newImages];
      updateData.images = allImages;
    }

    const updated = await Property.updateProperty(id, updateData);
    res.json(updated);
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.getPropertyById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    if (property.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await Property.deleteProperty(id);
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ message: "Server error" });
  }
};