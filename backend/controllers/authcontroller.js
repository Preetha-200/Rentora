const { auth, db } = require("../config/firebase");

// Register User
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name,
        });

        const user = {
            uid: userRecord.uid,
            name,
            email,
            phone,
            role: role || "tenant",
            createdAt: new Date(),
        };

        await db.collection("users").doc(userRecord.uid).set(user);

        const token = await auth.createCustomToken(userRecord.uid);

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            token,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email } = req.body;

        const userRecord = await auth.getUserByEmail(email);

        const userDoc = await db.collection("users").doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const token = await auth.createCustomToken(userRecord.uid);

        res.status(200).json({
            success: true,
            token,
            user: userDoc.data(),
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Logged-in User Profile
exports.getProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split("Bearer ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing",
            });
        }

        const decoded = await auth.verifyIdToken(token);

        const userDoc = await db.collection("users").doc(decoded.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user: userDoc.data(),
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};