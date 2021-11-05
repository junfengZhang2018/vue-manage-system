import axios from 'axios';
import { ElMessage } from "element-plus";
import util from '@/utils'
import router from '../router';
const service = axios.create({
    // process.env.NODE_ENV === 'development' 来判断是否开发环境
    // easy-mock服务挂了，暂时不使用了
    baseURL: import.meta.env.VITE_API,
    timeout: 15000
});

service.interceptors.request.use(
    config => {
        if (config.method.toLowerCase() == 'get') {
            config.params = config.data;
        }
        config.headers.token = localStorage.getItem('token');
        if (config.form) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            if (response.data.code !== 0) {
                ElMessage.error(response.data.message);
                if (response.data.code === 10003) {
                    router.replace('/login');
                }
                return Promise.reject(response.data);
            } else {
                return response.data.data;
            }
        } else {
            return Promise.reject(response);
        }
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
);

export default service;
