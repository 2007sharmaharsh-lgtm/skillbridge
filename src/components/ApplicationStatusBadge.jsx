import React from 'react';
import { Clock, CheckCircle2, XCircle, UserCheck, Calendar, FileText } from 'lucide-react';
import { APPLICATION_STATUS_LABELS } from '../constants';

export default function ApplicationStatusBadge({ status }) {
  const normalized = status ? status.toLowerCase() : 'applied';
  const label = APPLICATION_STATUS_LABELS[normalized] || normalized;

  const renderIcon = () => {
    switch (normalized) {
      case 'applied':
        return <FileText size={13} />;
      case 'under_review':
        return <Clock size={13} />;
      case 'shortlisted':
        return <UserCheck size={13} />;
      case 'interview':
        return <Calendar size={13} />;
      case 'selected':
        return <CheckCircle2 size={13} />;
      case 'rejected':
        return <XCircle size={13} />;
      default:
        return <Clock size={13} />;
    }
  };

  return (
    <span className={`badge badge-${normalized}`}>
      {renderIcon()}
      {label}
    </span>
  );
}
