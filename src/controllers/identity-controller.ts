import  express from 'express';
import { identityService } from '../service/identity-service';

export const createContactController = async (req : express.Request, res : express.Response) => {
    try {
        let { email , phoneNumber } = req.body;

        if (!email && !phoneNumber) {
            res.status(400).json({ message: "Either email or phone number must be provided..." });
        }

        if (phoneNumber !== undefined && phoneNumber !== null) {
            phoneNumber = String(phoneNumber);
        }

        const contact_response = await identityService(email, phoneNumber)
        res.status(contact_response.status).json(contact_response)

    } catch (error){
        console.error("Something went wrong while handling the contact creation:", error);
        res.status(500).json({ success : false, message: "Internal Server Error", error });
    }

}