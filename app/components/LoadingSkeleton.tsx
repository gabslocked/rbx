import React from 'react';

interface LoadingSkeletonProps {
  height?: string;
  width?: string;
  className?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  height = "h-4",
  width = "w-full",
  className = "",
  count = 1
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} ${width} bg-gray-200 rounded animate-shimmer`}
          style={{
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
          }}
        />
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
      <div className="space-y-2">
        <LoadingSkeleton height="h-3" width="w-3/4" />
        <LoadingSkeleton height="h-3" width="w-1/2" />
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <LoadingSkeleton height="h-6" width="w-32" />
        <LoadingSkeleton height="h-8" width="w-8" />
      </div>
      <LoadingSkeleton height="h-8" width="w-20" className="mb-2" />
      <LoadingSkeleton height="h-4" width="w-24" />
    </div>
  );
};

export default LoadingSkeleton;
