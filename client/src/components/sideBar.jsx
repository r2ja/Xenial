import React from 'react';
import { Home, TrendingUp, User, Settings, LogOut, PlusCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../utils/authApi';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const handlePost = () => {
    navigate('/latest');
  };

  return (
    <div className="bg-xenial-dark text-white w-44 h-screen flex flex-col fixed left-0 top-0 border-r border-gray-700">
      <div className="p-6">
        <h1 className="text-xl font-heading font-bold text-xenial-blue">XENIAL</h1>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2 p-4 font-body">
          <SidebarItem icon={<Home />} text="latest" to="/latest" active={location.pathname === '/latest'} />
          <SidebarItem icon={<TrendingUp />} text="trending" to="/trending" active={location.pathname === '/trending'} />
          <SidebarItem icon={<User />} text="my profile" to="/profile" active={location.pathname === '/profile'} />
          <SidebarItem icon={<Settings />} text="settings" to="/settings" active={location.pathname === '/settings'} />
        </ul>
      </nav>
      <div className="p-4 mt-auto space-y-2 font-body">
        <button
          onClick={handlePost}
          className="w-full flex items-center space-x-2 p-2 rounded-lg bg-xenial-blue text-white hover:bg-xenial-blue-light transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>post</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 p-2 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>log out</span>
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, to, active }) => {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center space-x-2 p-2 rounded-lg ${
          active ? 'bg-xenial-blue text-white' : 'text-gray-400 hover:bg-gray-700'
        }`}
      >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
        <span className="font-mono">{text}</span>
      </Link>
    </li>
  );
};

export default Sidebar;