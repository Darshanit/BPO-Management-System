import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MdUpload, MdDescription, MdDelete } from 'react-icons/md';
import Card from './Card';
import Button from './Button';
import Select from './Select';
import { documentService } from '../../services';

const CATEGORY_OPTIONS = [
  { value: 'identity', label: 'Identity' },
  { value: 'education', label: 'Education' },
  { value: 'employment', label: 'Employment' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
];

/** File upload + list widget for any entity (Employee, Client, Candidate) via relatedKind/relatedId. */
export default function DocumentManager({ relatedKind, relatedId }) {
  const [category, setCategory] = useState('other');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['documents', relatedKind, relatedId],
    queryFn: () => documentService.getForEntity(relatedKind, relatedId).then((res) => res.data.data),
    enabled: !!relatedId,
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('relatedKind', relatedKind);
    formData.append('relatedId', relatedId);

    setIsUploading(true);
    try {
      await documentService.upload(formData);
      toast.success('Document uploaded');
      queryClient.invalidateQueries({ queryKey: ['documents', relatedKind, relatedId] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentService.remove(id);
      toast.success('Document removed');
      queryClient.invalidateQueries({ queryKey: ['documents', relatedKind, relatedId] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove document');
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-display font-bold text-lg">Documents</h3>
        <div className="flex items-center gap-2">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORY_OPTIONS}
            className="!py-2 text-sm"
          />
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
          <Button size="sm" variant="blue" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <MdUpload /> {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-black/50">Loading documents...</p>
      ) : data?.length ? (
        <ul className="space-y-2">
          {data.map((doc) => (
            <li
              key={doc._id}
              className="flex items-center justify-between border-2 border-black/10 rounded-brutal-sm px-3 py-2"
            >
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 font-semibold hover:text-brutal-pink truncate"
              >
                <MdDescription /> {doc.name}
              </a>
              <button onClick={() => handleDelete(doc._id)} className="text-black/40 hover:text-brutal-pink">
                <MdDelete />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-black/50">No documents uploaded yet.</p>
      )}
    </Card>
  );
}
