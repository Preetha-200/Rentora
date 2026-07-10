import { json } from "@sveltejs/kit";

let rentalRequests = [];

// Get All Rental Requests
export async function GET() {
    return json({
        success: true,
        count: rentalRequests.length,
        data: rentalRequests
    });
}

// Create Rental Request
export async function POST({ request }) {

    const body = await request.json();

    const rentalRequest = {
        id: rentalRequests.length + 1,
        propertyId: body.propertyId,
        tenantId: body.tenantId,
        ownerId: body.ownerId,
        moveInDate: body.moveInDate,
        status: "Pending"
    };

    rentalRequests.push(rentalRequest);

    return json({
        success: true,
        message: "Rental request created successfully.",
        data: rentalRequest
    });
}

// Update Request Status
export async function PATCH({ request }) {

    const { id, action } = await request.json();

    const rentalRequest = rentalRequests.find(r => r.id === id);

    if (!rentalRequest) {
        return json(
            {
                success: false,
                message: "Rental request not found."
            },
            { status: 404 }
        );
    }

    if (action === "approve") {
        rentalRequest.status = "Approved";
    } else if (action === "reject") {
        rentalRequest.status = "Rejected";
    } else if (action === "cancel") {
        rentalRequest.status = "Cancelled";
    } else {
        return json(
            {
                success: false,
                message: "Invalid action."
            },
            { status: 400 }
        );
    }

    return json({
        success: true,
        message: `Rental request ${rentalRequest.status}.`,
        data: rentalRequest
    });
}

// Delete Rental Request
export async function DELETE({ request }) {

    const { id } = await request.json();

    const index = rentalRequests.findIndex(r => r.id === id);

    if (index === -1) {
        return json(
            {
                success: false,
                message: "Rental request not found."
            },
            { status: 404 }
        );
    }

    rentalRequests.splice(index, 1);

    return json({
        success: true,
        message: "Rental request deleted successfully."
    });
}