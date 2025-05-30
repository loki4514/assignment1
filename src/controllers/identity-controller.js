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
exports.createContactController = void 0;
const identity_service_1 = require("../service/identity-service");
const createContactController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, phoneNumber } = req.body;
        if (!email && !phoneNumber) {
            res.status(400).json({ message: "Either email or phone number must be provided..." });
        }
        if (phoneNumber !== undefined && phoneNumber !== null) {
            phoneNumber = String(phoneNumber);
        }
        const contact_response = yield (0, identity_service_1.identityService)(email, phoneNumber);
        res.status(contact_response.status).json(contact_response);
    }
    catch (error) {
        console.error("Something went wrong while handling the contact creation:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
});
exports.createContactController = createContactController;
