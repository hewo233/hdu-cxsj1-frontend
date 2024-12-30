import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import UserEditModal from '../components/UserEditModal';
import BookFormModal from '../components/BookFormModal';

const COVER_BASE_URL = 'http://localhost:8080/static/covers/';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userInfo, setUserInfo] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const booksPerPage = 20;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        console.log('Stored user info:', parsedUserInfo); // 添加调试日志
        setUserInfo(parsedUserInfo);
      } else {
        // 如果没有用户信息，重新登录
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      navigate('/login');
      return;
    }
    
    fetchBooks();
  }, [navigate]);

  const fetchBooks = async () => {
    try {
      const response = await axiosInstance.get('/book/list');
      const booksData = Array.isArray(response) ? response : response.books || [];
      console.log('Book data structure:', booksData[0]); // 打印第一本书的数据结构
      setBooks(booksData);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
      
      // 处理不同类型的错误
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          navigate('/login');
        } else {
          // 处理其他错误状态码
          console.error('Server error:', error.response.data);
        }
      } else if (error.request) {
        // 请求发出但没有收到响应
        console.error('No response received:', error.request);
      } else {
        // 请求配置出错
        console.error('Request config error:', error.message);
      }
    }
  };

  const filteredBooks = Array.isArray(books) 
    ? books.filter(book => 
      book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.intro.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // 添加图书
  const handleAdd = () => {
    setSelectedBooks(new Set());
    setShowAddModal(true);
  };

  // 编辑图书
  const handleEdit = () => {
    if (selectedBooks.size !== 1) {
      alert('请选择一本要编辑的图书');
      return;
    }
    const selectedBookId = Array.from(selectedBooks)[0];
    const selectedBook = books.find(book => book.bid === selectedBookId);
    if (!selectedBook) {
      alert('找不到选中的图书');
      return;
    }
    setShowEditModal(true);
  };

  // 删除图书
  const handleDelete = async () => {
    if (selectedBooks.size === 0) {
      alert('请先选择要删除的图书');
      return;
    }

    if (window.confirm(`确定要删除选中的 ${selectedBooks.size} 本书吗？`)) {
      try {
        await Promise.all(
          Array.from(selectedBooks).map(bid =>
            axiosInstance.delete(`/book/${bid}`)
          )
        );
        fetchBooks();
        setSelectedBooks(new Set());
      } catch (error) {
        console.error('Error deleting books:', error);
        alert('删除失败');
      }
    }
  };

  // 选择图书
  const handleSelectBook = (bookId) => {
    console.log('Book ID type:', typeof bookId); // 检查 ID 的类型
    console.log('Book ID value:', bookId); // 检查 ID 的值
    if (bookId === undefined || bookId === null) {
      console.error('Invalid book ID');
      return;
    }
    setSelectedBooks(new Set([bookId]));
  };

  // 添加获取用户信息的函数
  const fetchUserInfo = async (userId) => {
    try {
      const response = await axiosInstance.get(`/user/${userId}`);
      console.log('Fetched user info:', response);
      
      // 从 response.user 中获取用户信息
      if (response && response.user) {
        const userData = {
          ...response.user,
          // 使用后端返回的字段名
          uid: response.user.uid,
          name: response.user.name,
          gender: response.user.gender
        };
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUserInfo(userData);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // 修改用户信息更新的处理函数
  const handleUserUpdate = async (updatedUser) => {
    try {
      // 直接使用 uid
      const userId = updatedUser.uid;
      console.log('Updating user with ID:', userId);
      if (!userId) {
        throw new Error('User ID not found');
      }
      await fetchUserInfo(userId);
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">图书管理系统</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowUserModal(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              {userInfo?.name || userInfo?.Name || '用户'}
            </button>
            <span className="text-gray-600">
              {userInfo?.gender || userInfo?.Gender || ''}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between mb-4">
            <div className="space-x-2">
              <button 
                onClick={handleAdd}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                添加
              </button>
              <button 
                onClick={handleEdit}
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
                  selectedBooks.size !== 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={selectedBooks.size !== 1}
              >
                编辑
              </button>
              <button 
                onClick={handleDelete}
                className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${
                  selectedBooks.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={selectedBooks.size === 0}
              >
                删除
              </button>
            </div>
            <input
              type="text"
              placeholder="搜索书名或简介..."
              className="px-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    选择
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    封面
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    书号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    书名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    出版社
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    简介
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBooks.map((book) => (
                  <tr 
                    key={book.bid}
                    className={`hover:bg-gray-50 ${
                      selectedBooks.has(book.bid) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedBooks.has(book.bid)}
                        onChange={() => {
                          console.log('Book ID:', book.bid);
                          handleSelectBook(book.bid);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={`${COVER_BASE_URL}${book.cover_file.split('/').pop()}`}
                        alt={book.name} 
                        className="h-20 w-16 object-cover rounded shadow"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{book.bid}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{book.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{book.publisher}</td>
                    <td className="px-6 py-4">{book.intro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 border rounded ${
                  currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>

      {showUserModal && userInfo && (
        <UserEditModal
          user={userInfo}
          onClose={() => setShowUserModal(false)}
          onUpdate={handleUserUpdate}
        />
      )}

      {showAddModal && (
        <BookFormModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data) => {
            try {
              await axiosInstance.post('/book/add', data);
              fetchBooks();
              setShowAddModal(false);
            } catch (error) {
              console.error('Error adding book:', error);
              alert('添加失败');
            }
          }}
        />
      )}

      {showEditModal && (
        <BookFormModal
          book={books.find(book => selectedBooks.has(book.bid))}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBooks(new Set());
          }}
          onSubmit={async (data) => {
            try {
              await axiosInstance.put(`/book/${Array.from(selectedBooks)[0]}`, data, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });
              await fetchBooks();
              setShowEditModal(false);
              setSelectedBooks(new Set());
            } catch (error) {
              console.error('Error updating book:', error);
              alert('更新失败');
            }
          }}
        />
      )}
    </div>
  );
};

export default BookManagement; 