import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { MdDownload, MdPictureAsPdf, MdTableChart } from 'react-icons/md';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { reportService, departmentService } from '../services';

const REPORT_TYPES = [
  { value: 'attendance', label: 'Attendance Report', filters: ['dateRange'] },
  { value: 'leave', label: 'Leave Report', filters: ['status'] },
  { value: 'payroll', label: 'Payroll Report', filters: ['monthYear'] },
  { value: 'employee', label: 'Employee Report', filters: ['department'] },
  { value: 'department', label: 'Department Report', filters: [] },
  { value: 'project', label: 'Project Report', filters: ['projectStatus'] },
  { value: 'performance', label: 'Performance Report', filters: ['department'] },
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function Reports() {
  const [type, setType] = useState('attendance');
  const [format, setFormat] = useState('csv');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: departments } = useQuery({
    queryKey: ['departments-lookup'],
    queryFn: () => departmentService.list({ limit: 100 }).then((res) => res.data.data),
  });

  const activeConfig = REPORT_TYPES.find((r) => r.value === type);

  const buildFilters = () => {
    const filters = {};
    if (activeConfig?.filters.includes('dateRange') && from && to) {
      filters.from = from;
      filters.to = to;
    }
    if (activeConfig?.filters.includes('status') && status) filters.status = status;
    if (activeConfig?.filters.includes('projectStatus') && status) filters.status = status;
    if (activeConfig?.filters.includes('department') && department) filters.department = department;
    if (activeConfig?.filters.includes('monthYear')) {
      filters.month = month;
      filters.year = year;
    }
    return filters;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await reportService.download(type, { ...buildFilters(), format });
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h3 className="font-display font-bold text-lg mb-4">Report Type</h3>
          <div className="space-y-2">
            {REPORT_TYPES.map((r) => (
              <button
                key={r.value}
                onClick={() => setType(r.value)}
                className={`w-full text-left px-4 py-3 rounded-brutal-sm border-brutal font-display font-semibold text-sm transition-all
                  ${
                    type === r.value
                      ? 'bg-brutal-yellow border-black shadow-brutal-sm -translate-x-0.5 -translate-y-0.5'
                      : 'border-transparent hover:border-black hover:bg-brutal-yellow/30'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-display font-bold text-lg mb-4">{activeConfig?.label} Filters</h3>

          <div className="space-y-4">
            {activeConfig?.filters.includes('dateRange') && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            )}

            {activeConfig?.filters.includes('status') && type === 'leave' && (
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="All statuses"
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            )}

            {activeConfig?.filters.includes('projectStatus') && (
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="All statuses"
                options={[
                  { value: 'planning', label: 'Planning' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'on_hold', label: 'On Hold' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            )}

            {activeConfig?.filters.includes('department') && (
              <Select
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="All departments"
                options={(departments || []).map((d) => ({ value: d._id, label: d.name }))}
              />
            )}

            {activeConfig?.filters.includes('monthYear') && (
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Month"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  options={MONTH_NAMES.map((m, idx) => ({ value: idx + 1, label: m }))}
                />
                <Input label="Year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
              </div>
            )}

            {activeConfig?.filters.length === 0 && (
              <p className="text-black/50 text-sm">No additional filters for this report.</p>
            )}

            <div>
              <label className="block font-display font-bold text-sm mb-2">Format</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFormat('csv')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-brutal-sm border-brutal font-semibold text-sm ${
                    format === 'csv' ? 'bg-brutal-green' : 'bg-white'
                  }`}
                >
                  <MdTableChart /> CSV
                </button>
                <button
                  onClick={() => setFormat('pdf')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-brutal-sm border-brutal font-semibold text-sm ${
                    format === 'pdf' ? 'bg-brutal-pink text-white' : 'bg-white'
                  }`}
                >
                  <MdPictureAsPdf /> PDF
                </button>
              </div>
            </div>

            <Button variant="blue" onClick={handleDownload} disabled={isDownloading} className="w-full sm:w-auto">
              <MdDownload /> {isDownloading ? 'Generating...' : 'Download Report'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
