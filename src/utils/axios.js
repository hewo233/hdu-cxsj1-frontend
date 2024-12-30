import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080'
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // 检查 token 是否已经包含 'Bearer'
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
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
    if (response.data.errno !== 20000) {
      return Promise.reject({
        response: {
          status: response.data.errno,
          data: response.data
        }
      });
    }
    
    // 返回实际的数据部分
    return response.data.data || response.data;
  },
  (error) => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

export default instance; 