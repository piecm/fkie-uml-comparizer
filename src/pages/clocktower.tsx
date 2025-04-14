import React from 'react';
import ClockTowerComparison from '@/components/ClockTowerComparison';
import Header from '@/components/Header';

const ClockTowerPage: React.FC = () => {
  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="mt-8">
          <h1 className="text-2xl font-bold mb-6">ClockTower Model Comparison</h1>
          <p className="mb-6 text-gray-600">
            This visualization shows the differences between the original XMI model and the reconstructed model for the ClockTower example.
            Elements in <span className="text-green-500 font-semibold">green</span> are added in the reconstructed model,
            elements in <span className="text-red-500 font-semibold">red</span> are removed compared to the original model.
          </p>
          
          <div className="border border-gray-200 rounded-lg h-[800px] shadow-lg">
            <ClockTowerComparison />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockTowerPage; 