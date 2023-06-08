import axios from 'axios';
import Cookies from 'universal-cookie';

export const axios_instance = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? 'https://api.testhungnguyen.site/v1' : 'http://localhost:8002/v1',
});
export const axiosRefreshToken = axios_instance.create();

axios_instance.interceptors.request.use(
    (config) => {
        const cookies = new Cookies();

        console.log(`%cMaking request to /${config.url}`, 'color: #73a9ff');

        if (config.url === '/' || config.url.indexOf('/auth/refresh-token') >= 0) {
            return config;
        }

        const token = cookies.get('accessToken');

        return {
            ...config,
            headers: {
                ...config.headers,
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        };
    },
    (error) => {
        console.log(error);
        return Promise.reject(error);
    },
);

axios_instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const cookies = new Cookies();
        const refreshToken = cookies.get('refreshToken');

        const config = error?.config;

        if (error?.response?.status === 401 && !config?.sent) {
            config.sent = true;

            const { data } = await axiosRefreshToken.post(
                '/auth/refresh-token',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                    },
                },
            );

            if (data?.data.accessToken) {
                cookies.set('accessToken', data.data.accessToken, { path: '/' });
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${data.data.accessToken}`,
                };
            }

            return axios_instance(config);
        }
        return Promise.reject(error);
    },
);

export const axiosPrivate = axios_instance;
