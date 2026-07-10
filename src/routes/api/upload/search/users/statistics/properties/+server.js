import { json } from "@sveltejs/kit";

let properties = [
    {
        id: 1,
        title: "Luxury Apartment",
        city: "Salem",
        location: "Hasthampatti",
        propertyType: "Apartment",
        bhk: 2,
        price: 12000
    }
];

// Get All Properties
export async function GET() {
    return json({
        success: true,
        count: properties.length,
        data: properties
    });
}

// Add Property
export async function POST({ request }) {

    const body = await request.json();

    const property = {
        id: properties.length + 1,
        ...body
    };

    properties.push(property);

    return json({
        success: true,
        message: "Property added successfully.",
        data: property
    });
}

// Update Property
export async function PUT({ request }) {

    const body = await request.json();

    const index = properties.findIndex(
        p => p.id === body.id
    );

    if (index === -1) {
        return json(
            {
                success: false,
                message: "Property not found."
            },
            { status: 404 }
        );
    }

    properties[index] = {
        ...properties[index],
        ...body
    };

    return json({
        success: true,
        message: "Property updated successfully.",
        data: properties[index]
    });
}

// Delete Property
export async function DELETE({ request }) {

    const { id } = await request.json();

    const index = properties.findIndex(
        p => p.id === id
    );

    if (index === -1) {
        return json(
            {
                success: false,
                message: "Property not found."
            },
            { status: 404 }
        );
    }

    properties.splice(index, 1);

    return json({
        success: true,
        message: "Property deleted successfully."
    });
}