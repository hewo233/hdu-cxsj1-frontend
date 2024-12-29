import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserEditModal from '../components/UserEditModal';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userInfo, setUserInfo] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
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
        if (parsedUserInfo && typeof parsedUserInfo === 'object') {
          setUserInfo(parsedUserInfo);
        } else {
          localStorage.removeItem('userInfo');
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    
    fetchBooks();
  }, [navigate]);

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/book/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(response.data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    }
  };

  const filteredBooks = books.filter(book => 
    book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.intro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

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
              <button className="bg-green-500 text-white px-4 py-2 rounded">添加</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded">编辑</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded">删除</button>
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
                  <tr key={book.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={book.cover} alt={book.name} className="h-20 w-16 object-cover"/>
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
    </div>
  );
};

export default BookManagement; 