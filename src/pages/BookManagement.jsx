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
  const [selectedBook, setSelectedBook] = useState(null);
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
      console.log('Books data:', response); // 调试日志
      console.log('Raw response:', response);
      
      // 确保 response 是数组或者从 response 中获取正确的数组字段
      const booksData = Array.isArray(response) ? response : response.books || [];
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
    setSelectedBook(null); // 清空选中的书
    setShowAddModal(true);
  };

  // 编辑图书
  const handleEdit = () => {
    if (!selectedBook) {
      alert('请先选择要编辑的图书');
      return;
    }
    setShowEditModal(true);
  };

  // 删除图书
  const handleDelete = async () => {
    if (!selectedBook) {
      alert('请先选择要删除的图书');
      return;
    }

    if (window.confirm('确定要删除这本书吗？')) {
      try {
        await axiosInstance.delete(`/book/${selectedBook.id}`);
        fetchBooks(); // 重新获取图书列表
        setSelectedBook(null);
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('删除失败');
      }
    }
  };

  // 选择图书
  const handleSelectBook = (book) => {
    setSelectedBook(selectedBook?.id === book.id ? null : book);
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
              {userInfo?.name}
            </button>
            <span className="text-gray-600">{userInfo?.gender}</span>
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
                  !selectedBook ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                编辑
              </button>
              <button 
                onClick={handleDelete}
                className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${
                  !selectedBook ? 'opacity-50 cursor-not-allowed' : ''
                }`}
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
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedBook?.id === book.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={`${COVER_BASE_URL}${book.cover_file.split('/').pop()}`}
                        alt={book.name} 
                        className="h-20 w-16 object-cover rounded shadow"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{book.id}</td>
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
          onUpdate={(updatedUser) => setUserInfo(updatedUser)}
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

      {showEditModal && selectedBook && (
        <BookFormModal
          book={selectedBook}
          onClose={() => setShowEditModal(false)}
          onSubmit={async (data) => {
            try {
              await axiosInstance.put(`/book/${selectedBook.id}`, data);
              fetchBooks();
              setShowEditModal(false);
              setSelectedBook(null);
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