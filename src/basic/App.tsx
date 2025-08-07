import { useState, useCallback } from 'react';
import Header from './components/Header';
import NotificationContainer from './components/NotificationContainer';
import AdminPage from './components/AdminPage';
import CustomerPage from './components/CustomerPage';
import { useNotification } from './hooks/useNotification';

import { useSearchTerm } from './hooks/useSearchTerm';

const App = () => {
  // UI관련 상태값들
  const [isAdmin, setIsAdmin] = useState(false);
  const { notifications, addNotification, removeNotification } = useNotification();
  const { searchTerm, setSearchTerm, debouncedSearchTerm } = useSearchTerm();
  const toggleAdmin = useCallback(() => {
    setIsAdmin(prev => !prev);
  }, []);

  // --------------- UI 데이터 -------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 알림 메시지 컴포넌트 */}
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
      {/* 헤더 컴포넌트 */}
      <Header isAdmin={isAdmin} searchTerm={searchTerm} setSearchTerm={setSearchTerm} toggleAdmin={toggleAdmin} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminPage addNotification={addNotification} />
        ) : (
          <CustomerPage debouncedSearchTerm={debouncedSearchTerm} addNotification={addNotification} />
        )}
      </main>
    </div>
  );
};

export default App;
