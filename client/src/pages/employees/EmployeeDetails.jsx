import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MdArrowBack } from 'react-icons/md';

import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import DocumentManager from '../../components/ui/DocumentManager';
import { employeeService } from '../../services';

export default function EmployeeDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getById(id).then((res) => res.data.data),
  });

  const submitReview = async () => {
    try {
      await employeeService.addPerformanceReview(id, { rating: Number(rating), comments });
      toast.success('Performance review added');
      setIsReviewOpen(false);
      setComments('');
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/employees" className="inline-flex items-center gap-2 font-semibold hover:text-brutal-pink">
        <MdArrowBack /> Back to Employees
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 text-center">
          <div className="w-20 h-20 mx-auto rounded-full border-brutal border-black bg-brutal-yellow flex items-center justify-center font-display font-bold text-2xl mb-4">
            {employee?.user?.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="font-display font-bold text-xl">{employee?.user?.name}</h2>
          <p className="text-black/60 font-semibold">{employee?.designation}</p>
          <div className="mt-3">
            <Badge status={employee?.employmentStatus}>{employee?.employmentStatus}</Badge>
          </div>
          <dl className="mt-6 text-left space-y-3">
            <div>
              <dt className="text-xs font-bold uppercase text-black/50">Employee ID</dt>
              <dd className="font-semibold">{employee?.employeeId}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-black/50">Email</dt>
              <dd className="font-semibold">{employee?.user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-black/50">Department</dt>
              <dd className="font-semibold">{employee?.department?.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-black/50">Joining Date</dt>
              <dd className="font-semibold">
                {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : '—'}
              </dd>
            </div>
          </dl>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-display font-bold text-lg mb-4">Leave Balance</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{employee?.leaveBalance?.casual ?? 0}</p>
                <p className="text-xs font-semibold text-black/50 uppercase">Casual</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{employee?.leaveBalance?.medical ?? 0}</p>
                <p className="text-xs font-semibold text-black/50 uppercase">Medical</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{employee?.leaveBalance?.paid ?? 0}</p>
                <p className="text-xs font-semibold text-black/50 uppercase">Paid</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Performance History</h3>
              <Button size="sm" variant="blue" onClick={() => setIsReviewOpen(true)}>
                Add Review
              </Button>
            </div>
            {employee?.performanceHistory?.length ? (
              <ul className="space-y-3">
                {employee.performanceHistory.map((review, idx) => (
                  <li key={idx} className="border-2 border-black/10 rounded-brutal-sm p-3">
                    <div className="flex justify-between font-semibold">
                      <span>Rating: {review.rating}/5</span>
                      <span className="text-black/50 text-sm">
                        {review.reviewDate ? new Date(review.reviewDate).toLocaleDateString() : ''}
                      </span>
                    </div>
                    {review.comments && <p className="text-black/70 mt-1">{review.comments}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-black/50">No performance reviews yet.</p>
            )}
          </Card>

          <DocumentManager relatedKind="Employee" relatedId={id} />
        </div>
      </div>

      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Add Performance Review">
        <div className="space-y-4">
          <Input
            label="Rating (1-5)"
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
          <div>
            <label className="block font-display font-bold text-sm mb-2">Comments</label>
            <textarea
              className="input-brutal"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="white" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button variant="blue" onClick={submitReview}>
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
