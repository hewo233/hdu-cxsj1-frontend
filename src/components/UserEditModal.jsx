import React, { useState } from 'react';
import axiosInstance from '../utils/axios';

const UserEditModal = ({ user, onClose, onUpdate }) => {
  console.log('User data in modal:', user);

  const [formData, setFormData] = useState({
    name: user.name || '',
    gender: user.gender || '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = user.uid;
      console.log('User ID:', userId);
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          dataToSend[key] = formData[key];
        }
      });

      console.log('Data to send:', dataToSend);
      const response = await axiosInstance.put(`/user/${userId}`, dataToSend);
      
      if (response) {
        onUpdate({
          ...user,
          ...dataToSend,
          password: undefined
        });
        
        alert('更新成功！');
        onClose();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('更新失败：' + (error.response?.data?.message || '未知错误'));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">编辑个人信息</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">昵称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">新密码（可选）</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="留空表示不修改密码"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">性别</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal; 