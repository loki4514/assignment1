import express from 'express';
import { createContactController } from '../controllers/identity-controller';

const router = express.Router();

router.post('/identify', createContactController);

export default router;
