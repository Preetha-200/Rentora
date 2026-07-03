const { auth, db } = require("../config/firebase");

// Register User
exports.register = async (req, res) => {
    try {

        const { name, email, password, phone, role } = req.body;

        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name
        });

        await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            name,
            email,
            phone,
            role: role || "tenant",
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: "User Registered Successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};