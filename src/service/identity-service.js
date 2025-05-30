"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityService = void 0;
const prisma_1 = require("../../prisma/generated/prisma");
const prisma = new prisma_1.PrismaClient();
const findTheExistingContacts = (email, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.contact.findMany({
        where: {
            OR: [
                { email: email || undefined },
                { phoneNumber: phoneNumber || undefined }
            ]
        },
        orderBy: { createdAt: 'asc' }
    });
});
const identityService = (email, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingContacts = yield findTheExistingContacts(email, phoneNumber);
        let primaryContact;
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
            primaryContact = yield prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: "PRIMARY",
                },
            });
        }
        else {
            // Get the oldest primary
            const directPrimary = existingContacts.find(c => c.linkPrecedence === 'PRIMARY');
            const anyContact = existingContacts[0];
            if (directPrimary) {
                primaryContact = directPrimary;
            }
            else if (anyContact.linkedId) {
                const fetchedPrimary = yield prisma.contact.findUnique({
                    where: { id: anyContact.linkedId },
                });
                if (!fetchedPrimary) {
                    throw new Error("Linked primary contact not found");
                }
                primaryContact = fetchedPrimary;
            }
            else {
                primaryContact = anyContact;
            }
            const emailExists = existingContacts.some((c) => c.email === email);
            const phoneExists = existingContacts.some((c) => c.phoneNumber === phoneNumber);
            // If both provided and at least one doesn't exist in any record, create secondary
            if (email && phoneNumber && (!emailExists || !phoneExists)) {
                // Create secondary contact
                yield prisma.contact.create({
                    data: {
                        email,
                        phoneNumber,
                        linkPrecedence: 'SECONDARY',
                        linkedId: primaryContact.id,
                    },
                });
                // If there's another primary that isn't the current primary, demote it
            }
            else if (email && phoneNumber || (!emailExists && !phoneExists)) {
                for (const contact of existingContacts) {
                    if (contact.linkPrecedence === "PRIMARY" &&
                        contact.id !== primaryContact.id) {
                        yield prisma.contact.update({
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
        const allContacts = yield prisma.contact.findMany({
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
        const primary = allContacts.find((c) => c.linkPrecedence === "PRIMARY") || allContacts[0];
        // Build response
        const emails = new Set();
        const phoneNumbers = new Set();
        const secondaryIds = [];
        for (const contact of allContacts) {
            if (contact.email)
                emails.add(contact.email);
            if (contact.phoneNumber)
                phoneNumbers.add(contact.phoneNumber);
            if (contact.id !== primary.id)
                secondaryIds.push(contact.id);
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
    }
    catch (error) {
        console.error("Error handling identity service:", error);
        return {
            status: 500,
            success: false,
            message: "Internal server error. Please try again later."
        };
    }
});
exports.identityService = identityService;
