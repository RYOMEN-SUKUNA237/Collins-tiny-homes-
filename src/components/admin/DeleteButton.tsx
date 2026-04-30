'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  id: string;
  entityType: 'listings' | 'lands' | 'inquiries' | 'payments';
  label?: string;
  className?: string;
}

export default function DeleteButton({ id, entityType, label = 'Delete', className }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${entityType.slice(0, -1)}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/${entityType}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Delete failed. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={className ?? 'p-2 rounded-lg text-charcoal-light hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50'}
      title={label}
    >
      {loading
        ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        : <Trash2 className="w-4 h-4" />
      }
    </button>
  );
}
