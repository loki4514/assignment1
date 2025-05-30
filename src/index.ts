import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createContactController } from './controllers/identity-controller';
dotenv.config();
import apiRoutes from './routers/index'



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample route
app.get('/', async (req: Request, res: Response) => {
    res.send('API is running 🚀');
});

app.use("/api/v1", apiRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
