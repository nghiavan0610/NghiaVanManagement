import mongoose from 'mongoose';

export interface TokenPayload {
    userId: mongoose.Types.ObjectId;
    sessionId: string;
}
