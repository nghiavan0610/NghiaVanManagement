import * as Axios from 'axios';
import Cookies from 'universal-cookie';

const BASEURL = 'https://api.testhungnguyen.site/v1'
// const BASEURL = 'http://66.42.54.184:6867/v1'

export const axios = Axios.create({
  baseURL: BASEURL,
});
export const axiosRefreshToken = axios.create();

axios.interceptors.request.use(
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

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const cookies = new Cookies();
    const refreshToken = cookies.get('refreshToken');
    const config = error?.config;

    if (error?.response?.status === 401 && !config?.sent) {
      config.sent = true;

      const {data} = await axiosRefreshToken.post("/auth/refresh-token", {}, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        }
      });

      if (data?.data.accessToken) {
        cookies.set('accessToken', data.data.accessToken, { path: '/' });
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${data.data.accessToken}`,
        };
      }

      return axios(config);
    }
    return Promise.reject(error);
  }
);

export const axiosPrivate = axios;