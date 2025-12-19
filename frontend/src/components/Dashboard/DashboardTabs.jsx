import React from 'react';

const DashboardTabs = ({ tabs, activeTab, onTabChange }) => {
  const active = tabs.find((tab) => tab.id === activeTab);
  const inactiveClassName = 'text-gray-600 hover:bg-gray-100';

  return (
    <>
      <div className="bg-white rounded-t-3xl border-b-2 border-gray-200">
        <div className="flex gap-2 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isActive ? tab.activeClassName : (tab.inactiveClassName || inactiveClassName)
                }`}
              >
                {Icon && <Icon size={20} />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      {active ? active.content : null}
    </>
  );
};

export default DashboardTabs;
