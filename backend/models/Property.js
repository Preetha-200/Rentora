const { db } = require("../config/firebase");
const { bucket } = require("../config/firebase");

const COLLECTION = "properties";

const createProperty = async (propertyData) => {
  const docRef = db.collection(COLLECTION).doc();
  await docRef.set({
    ...propertyData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...propertyData };
};

const getPropertyById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const getAllProperties = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  if (filters.status) {
    query = query.where("status", "==", filters.status);
  }
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const getPropertiesByOwner = async (ownerId) => {
  const snapshot = await db
    .collection(COLLECTION)
    .where("ownerId", "==", ownerId)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const updateProperty = async (id, updateData) => {
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  return getPropertyById(id);
};

const deleteProperty = async (id) => {
  const property = await getPropertyById(id);
  if (!property) return null;

  if (property.images && property.images.length > 0) {
    for (const imageUrl of property.images) {
      try {
        const fileName = imageUrl.split("/").pop().split("?")[0];
        const file = bucket.file(`properties/${fileName}`);
        await file.delete();
      } catch (err) {
        console.error("Failed to delete image:", err.message);
      }
    }
  }

  await db.collection(COLLECTION).doc(id).delete();
  return property;
};

const uploadImages = async (files, propertyId) => {
  const uploadedUrls = [];
  for (const file of files) {
    const fileName = `${propertyId}_${Date.now()}_${file.originalname}`;
    const fileRef = bucket.file(`properties/${fileName}`);
    await fileRef.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "01-01-2030",
    });
    uploadedUrls.push(url);
  }
  return uploadedUrls;
};

module.exports = {
  createProperty,
  getPropertyById,
  getAllProperties,
  getPropertiesByOwner,
  updateProperty,
  deleteProperty,
  uploadImages,
};