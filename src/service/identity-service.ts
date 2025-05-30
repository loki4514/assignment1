import { PrismaClient } from '../../prisma/generated/prisma';
const prisma = new PrismaClient();
import { IContactInterface } from '../types/identity-interface';

const findTheExistingContacts = async (email?: string, phoneNumber?: string) => {
    return prisma.contact.findMany({
        where: {
            OR: [
                { email: email || undefined },
                { phoneNumber: phoneNumber || undefined }
            ]
        },
        orderBy: { createdAt: 'asc' }
    });
};

export const identityService = async (email?: string, phoneNumber?: string) => {
    try {


        const existingContacts = await findTheExistingContacts(email, phoneNumber);

        let primaryContact: IContactInterface;

        if (existingContacts.length === 0) {
            if (!email || !phoneNumber) {
                return {
                    status: 400,
                    success: false,
                    message: "Email and phone number must be provided. Since it's new record"
                };
            }
            // No contacts exist, create new primary
            // console.log("this is email and kasldf", email, phoneNumber)
            primaryContact = await prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: "PRIMARY",
                },
            });
        } else {
            // Get the oldest primary
            const directPrimary = existingContacts.find(c => c.linkPrecedence === 'PRIMARY');
            const anyContact = existingContacts[0];

            if (directPrimary) {
                primaryContact = directPrimary;
            } else if (anyContact.linkedId) {
                const fetchedPrimary = await prisma.contact.findUnique({
                    where: { id: anyContact.linkedId },
                });

                if (!fetchedPrimary) {
                    throw new Error("Linked primary contact not found");
                }

                primaryContact = fetchedPrimary;
            } else {
                primaryContact = anyContact;
            }


            const emailExists = existingContacts.some((c: IContactInterface) => c.email === email);
            const phoneExists = existingContacts.some((c: IContactInterface) => c.phoneNumber === phoneNumber);



            // If both provided and at least one doesn't exist in any record, create secondary

            if (email && phoneNumber && (!emailExists || !phoneExists)) {
                // Create secondary contact
                await prisma.contact.create({
                    data: {
                        email,
                        phoneNumber,
                        linkPrecedence: 'SECONDARY',
                        linkedId: primaryContact.id,
                    },
                });

                // If there's another primary that isn't the current primary, demote it

                
            } else if (email && phoneNumber || (!emailExists && !phoneExists)){
                
                for (const contact of existingContacts) {
                    if (
                        contact.linkPrecedence === "PRIMARY" &&
                        contact.id !== primaryContact.id
                    ) {
                        
                        await prisma.contact.update({
                            where: { id: contact.id },
                            data: {
                                linkPrecedence: "SECONDARY",
                                linkedId: primaryContact.id,
                                updatedAt: new Date(),
                            },
                        });
                    }
                }

            }

        }

        // Refetch all related contacts using primary contact's id
        const allContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { id: primaryContact.id },
                    { linkedId: primaryContact.id },
                    // { linkedId: { equals: primaryContact.linkedId ?? undefined } }, // just in case linkedId != null
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        // Normalize primary contact
        const primary = allContacts.find((c: IContactInterface) => c.linkPrecedence === "PRIMARY") || allContacts[0];

        // Build response
        const emails = new Set<string>();
        const phoneNumbers = new Set<string>();
        const secondaryIds: number[] = [];

        for (const contact of allContacts) {
            if (contact.email) emails.add(contact.email);
            if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
            if (contact.id !== primary.id) secondaryIds.push(contact.id);
        }

        return {
            status: 200,
            success: true,
            message: "Contact found or created",
            data: {
                contact: {
                    primaryContactId: primary.id,
                    emails: Array.from(emails),
                    phoneNumbers: Array.from(phoneNumbers),
                    secondaryContactIds: secondaryIds
                }
            }
        };

    } catch (error) {
        console.error("Error handling identity service:", error);
        return {
            status: 500,
            success: false,
            message: "Internal server error. Please try again later."
        };
    }
};
