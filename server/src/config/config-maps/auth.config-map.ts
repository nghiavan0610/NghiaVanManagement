import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    access: {
        secret: process.env.ACCESS_SECRET,
        expiresIn: Number(process.env.ACCESS_EXPIRES_IN),
    },
    refresh: {
        secret: process.env.REFRESH_SECRET,
        expiresIn: Number(process.env.REFRESH_EXPIRES_IN),
    },
}));
