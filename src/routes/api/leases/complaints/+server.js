import { json } from "@sveltejs/kit";

let complaints = [];

// Get All Complaints or Complaint by ID
export async function GET({ url }) {

    const id = url.searchParams.get("id");

    if (id) {

        const complaint = complaints.find(
            c => c.id === Number(id)
        );

        if (!complaint) {
            return json(
                {
                    success: false,
                    message: "Complaint not found."
                },
                { status: 404 }
            );
        }

        return json({
            success: true,
            data: complaint
        });
    }

    return json({
        success: true,
        count: complaints.length,
        data: complaints
    });
}

// Create Complaint
export async function POST({ request }) {

    const body = await request.json();

    const complaint = {
        id: complaints.length + 1,
        propertyId: body.propertyId,
        tenantId: body.tenantId,
        subject: body.subject,
        description: body.description,
        status: "Pending",
        createdAt: new Date().toISOString()
    };

    complaints.push(complaint);

    return json({
        success: true,
        message: "Complaint created successfully.",
        data: complaint
    });
}

// Update Complaint
export async function PUT({ request }) {

    const body = await request.json();

    const complaint = complaints.find(
        c => c.id === body.id
    );

    if (!complaint) {
        return json(
            {
                success: false,
                message: "Complaint not found."
            },
            { status: 404 }
        );
    }

    Object.assign(complaint, body);

    return json({
        success: true,
        message: "Complaint updated successfully.",
        data: complaint
    });
}

// Resolve Complaint
export async function PATCH({ request }) {

    const { id } = await request.json();

    const complaint = complaints.find(
        c => c.id === id
    );

    if (!complaint) {
        return json(
            {
                success: false,
                message: "Complaint not found."
            },
            { status: 404 }
        );
    }

    complaint.status = "Resolved";

    return json({
        success: true,
        message: "Complaint resolved successfully.",
        data: complaint
    });
}

// Delete Complaint
export async function DELETE({ request }) {

    const { id } = await request.json();

    const index = complaints.findIndex(
        c => c.id === id
    );

    if (index === -1) {
        return json(
            {
                success: false,
                message: "Complaint not found."
            },
            { status: 404 }
        );
    }

    complaints.splice(index, 1);

    return json({
        success: true,
        message: "Complaint deleted successfully."
    });
}