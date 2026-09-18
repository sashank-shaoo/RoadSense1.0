export const formatScore = (score, decimals = 1) => {
  if (score === null || score === undefined || score === '') return 'N/A';
  const num = Number(score);
  return Number.isFinite(num) ? num.toFixed(decimals) : 'N/A';
};

// Utility functions for severity mapping
export const getSeverityLevel = (report) => {
  const score = Number(report?.damage_score) || 0;
  const severity = report?.highest_severity?.toUpperCase();

  if (severity === 'CRITICAL' || score >= 8) return 'critical';
  if (severity === 'HIGH' || score >= 5.5) return 'high';
  if (severity === 'MEDIUM' || score >= 3) return 'medium';
  return 'low';
};

export const getSeverityColor = (level) => {
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#10b981',
  };
  return colors[level] || colors.low;
};

export const getSeverityLabel = (level) => {
  const labels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return labels[level] || 'Low';
};

export const getStatusLabel = (status) => {
  const map = {
    notStarted: 'Not Started',
    onGoing: 'In Progress',
    completed: 'Completed',
  };
  return map[status] || status;
};

export const getStatusColor = (status) => {
  const map = {
    notStarted: '#94a3b8',
    onGoing: '#f59e0b',
    completed: '#10b981',
  };
  return map[status] || '#94a3b8';
};

export const formatRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
};

export const getCreditRank = (points) => {
  if (points >= 500) return { label: 'Infrastructure Champion', color: '#f59e0b' };
  if (points >= 250) return { label: 'Pavement Guardian', color: '#06b6d4' };
  if (points >= 100) return { label: 'Road Scout', color: '#10b981' };
  return { label: 'Novice Reporter', color: '#94a3b8' };
};
