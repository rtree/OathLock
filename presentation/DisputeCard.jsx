import React from 'react';

const DisputeCard = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Logo Header */}
      <div className="text-center mb-1 px-6 py-6 bg-gradient-to-br from-white to-gray-50 rounded-t-3xl shadow-sm">
        <img 
          src="/img/oathlock-logo.png" 
          alt="OATHLOCK" 
          className="h-32 w-auto mx-auto drop-shadow-lg transition-transform duration-300 hover:scale-105"
          style={{
            filter: 'brightness(0) saturate(100%) invert(17%) sepia(85%) saturate(1342%) hue-rotate(202deg) brightness(94%) contrast(86%)'
          }}
        />
      </div>
      
      {/* Main Card */}
      <div className="bg-white rounded-b-3xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-stretch p-6 lg:p-10 gap-6 lg:gap-10">
          {/* Seller Section */}
          <div className="flex-1 text-center">
            <h3 className="text-sm font-semibold text-gray-500 mb-6 tracking-wider">SELLER</h3>
            
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-5 flex items-center justify-center relative">
              <div className="w-10 h-10 bg-blue-900 rounded-full relative">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
                <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-7 h-4 bg-white rounded-t-full"></div>
              </div>
            </div>
            
            <h4 className="text-xl font-semibold text-gray-800 mb-5">D. Carter</h4>
            
            {/* Stats */}
            <div className="flex justify-between mb-6 gap-5">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Transactions</span>
                <span className="text-base font-semibold text-gray-800">320</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Complaints</span>
                <span className="text-base font-semibold text-gray-800">12</span>
              </div>
            </div>
            
            {/* Issues */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-blue-400 transform rotate-45 rounded-sm"></div>
                <span className="text-blue-400 font-medium">Counterfeit</span>
                <span className="text-gray-800 font-semibold ml-auto">3</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-blue-400 rounded-full relative">
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs">×</span>
                </div>
                <span className="text-blue-400 font-medium">Damaged</span>
                <span className="text-gray-800 font-semibold ml-auto">5</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-blue-400 rounded-sm relative">
                  <div className="absolute -top-0.5 left-0.5 right-0.5 h-1 bg-blue-600 rounded-sm"></div>
                </div>
                <span className="text-blue-400 font-medium">Undelivered</span>
                <span className="text-gray-800 font-semibold ml-auto">4</span>
              </div>
            </div>
          </div>

          {/* Transaction Center */}
          <div className="flex flex-col items-center justify-center min-w-0 lg:min-w-48 border-t lg:border-t-0 lg:border-l lg:border-r border-gray-200 py-5 lg:py-0 lg:px-5">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-500 mb-6 lg:mb-8 tracking-wider">TRANSACTION</h3>
              
              {/* Product Image */}
              <div className="w-28 lg:w-30 h-28 lg:h-30 mx-auto mb-5 rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <img 
                  src="/img/polo-outfit.jpg" 
                  alt="Polo Ralph Lauren セットアップ" 
                  className="w-full h-full object-cover rounded-lg relative z-10"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.querySelector('.placeholder').classList.remove('hidden');
                  }}
                />
                <div className="placeholder hidden absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl text-gray-500 mb-1">📦</div>
                  <div className="text-xs text-gray-500">商品画像</div>
                </div>
              </div>
              
              <div className="text-3xl font-semibold text-gray-800 mb-5">$120.00</div>
              
              {/* Status Buttons */}
              <div className="flex gap-2.5 justify-center">
                <button className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-md text-sm cursor-pointer transition-all duration-200 hover:bg-gray-200">
                  Sent
                </button>
                <button className="px-4 py-2 border border-gray-300 bg-white rounded-md text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50">
                  Received
                </button>
              </div>
            </div>
          </div>

          {/* Buyer Section */}
          <div className="flex-1 text-center">
            <h3 className="text-sm font-semibold text-gray-500 mb-6 tracking-wider">BUYER</h3>
            
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-5 flex items-center justify-center relative">
              <div className="w-10 h-10 bg-blue-900 rounded-full relative">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
                <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-6 h-5 bg-white rounded-t-full"></div>
              </div>
            </div>
            
            <h4 className="text-xl font-semibold text-gray-800 mb-5">A. Jones</h4>
            
            {/* Stats */}
            <div className="flex justify-between mb-6 gap-5">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Transactions</span>
                <span className="text-base font-semibold text-gray-800">60</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Complaints</span>
                <span className="text-base font-semibold text-gray-800">1</span>
              </div>
            </div>
            
            {/* Issues */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-blue-400 rounded-sm relative">
                  <div className="absolute top-0.5 left-1 right-1 h-1.5 border-2 border-white border-b-0 rounded-t-sm"></div>
                </div>
                <span className="text-blue-400 font-medium">Undelivered</span>
                <span className="text-gray-800 font-semibold ml-auto">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 lg:p-10 border-t border-gray-200 text-center">
          <button className="bg-blue-900 text-white border-none px-8 lg:px-10 py-4 rounded-lg text-base font-semibold tracking-wider cursor-pointer transition-colors duration-300 hover:bg-blue-800 w-full max-w-xs">
            RAISE DISPUTE
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisputeCard;
