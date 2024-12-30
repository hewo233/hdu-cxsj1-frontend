import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080'
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = token;
    }
    console.log('Request config:', config); // 调试日志
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    console.log('Response:', response); // 调试日志
    
    // 检查响应状态
    if (response.data.errno !== 20000) { // 假设 20000 是成功状态码
      return Promise.reject({
        response: {
          status: response.data.errno,
          data: response.data
        }
      });
    }
    
    return response.data;
  },
  (error) => {
    console.error('Response error:', error); // 调试日志
    return Promise.reject(error);
  }
);

export default instance; 