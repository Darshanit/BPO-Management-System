import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';

import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import { employeeService, departmentService } from '../../services';
import useDebounce from '../../hooks/useDebounce';
import EmployeeFormModal from './EmployeeFormModal';

export default function EmployeeList() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  const { data: departmentsData } = useQuery({
    queryKey: ['departments-lookup'],
    queryFn: () => departmentService.list({ limit: 100 }).then((res) => res.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['employees', { search: debouncedSearch, department, status, page }],
    queryFn: () =>
      employeeService
        .list({
          search: debouncedSearch || undefined,
          department: department || undefined,
          employmentStatus: status || undefined,
          page,
          limit: 10,
        })
        .then((res) => res.data),
    keepPreviousData: true,
  });

  const handleCreated = () => {
    setIsFormOpen(false);
    toast.success('Employee created successfully');
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const columns = [
    {
      key: 'employeeId',
      label: 'Employee ID',
      render: (row) => (
        <Link to={`/employees/${row._id}`} className="font-bold underline hover:text-brutal-pink">
          {row.employeeId}
        </Link>
      ),
    },
    { key: 'name', label: 'Name', render: (row) => row.user?.name },
    { key: 'email', label: 'Email', render: (row) => row.user?.email },
    { key: 'department', label: 'Department', render: (row) => row.department?.name },
    { key: 'designation', label: 'Designation' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.employmentStatus}>{row.employmentStatus}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl">Employee Management</h1>
        <Button variant="green" onClick={() => setIsFormOpen(true)}>
          <MdAdd size={20} /> Add Employee
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email...">
        <Select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="All Departments"
          options={(departmentsData || []).map((d) => ({ value: d._id, label: d.name }))}
          className="sm:w-56"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="All Statuses"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'on_leave', label: 'On Leave' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'terminated', label: 'Terminated' },
          ]}
          className="sm:w-48"
        />
      </SearchBar>

      <Table columns={columns} data={data?.data || []} isLoading={isLoading} emptyMessage="No employees found" />
      <Pagination meta={data?.meta} onPageChange={setPage} />

      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleCreated}
        departments={departmentsData || []}
      />
    </div>
  );
}
