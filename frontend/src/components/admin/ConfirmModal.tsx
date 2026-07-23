"use client";

import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="md">
      <p className="mb-6 text-mad-muted">{message}</p>
      <div className="flex gap-3">
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          تأكيد
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}
