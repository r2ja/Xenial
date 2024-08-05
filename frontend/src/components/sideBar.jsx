import React from 'react';
import { Home, TrendingUp, User, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="bg-xenial-dark text-white w-64 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-xenial-blue">XENIAL</h1>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          <SidebarItem icon={<Home />} text="latest" active />
          <SidebarItem icon={<TrendingUp />} text="trending" />
          <SidebarItem icon={<User />} text="my profile" />
          <SidebarItem icon={<Settings />} text="settings" />
        </ul>
      </nav>
    </div>
  );
};

const SidebarItem = ({ icon, text, active }) => {
  return (
    <li>
      <a
        href="#"
        className={`flex items-center space-x-2 p-2 rounded-lg ${
          active ? 'bg-xenial-blue text-white' : 'text-gray-400 hover:bg-gray-700'
        }`}
      >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
        <span>{text}</span>
      </a>
    </li>
  );
};

export default Sidebar;