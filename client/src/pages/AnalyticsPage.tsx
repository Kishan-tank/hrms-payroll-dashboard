import DashboardLayout from '../layouts/DashboardLayout';

export default function AnalyticsPage() {
  return (
    <DashboardLayout title="Analytics">
      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Company Analytics
        </h2>
        {/* Add your custom charts or tables here */}
      </div>
    </DashboardLayout>
  );
}