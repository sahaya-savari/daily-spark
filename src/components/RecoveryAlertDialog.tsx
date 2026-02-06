/**
 * Recovery Alert Component
 *
 * Displays corrupted data recovery messages to user
 * Shows as a prominent alert banner with action button
 */

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRecoveryAlert } from '@/contexts/RecoveryAlertContext';

export const RecoveryAlertDialog = () => {
  const { alert, dismissAlert } = useRecoveryAlert();

  if (!alert.show) return null;

  const isWarning = alert.type === 'warning';
  const Icon = isWarning ? AlertCircle : CheckCircle2;
  const bgColor = isWarning ? 'bg-amber-50' : 'bg-blue-50';
  const borderColor = isWarning ? 'border-amber-200' : 'border-blue-200';
  const iconColor = isWarning ? 'text-amber-600' : 'text-blue-600';

  return (
    <Dialog open={alert.show} onOpenChange={dismissAlert}>
      <DialogContent className={`sm:max-w-md ${bgColor} border-2 ${borderColor}`}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${iconColor}`} />
            <DialogTitle className="text-lg font-semibold">{alert.title}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-gray-700">
          {alert.message}
        </DialogDescription>

        <div className="mt-6 flex gap-2">
          {alert.action && (
            <Button
              onClick={() => {
                alert.action?.onClick();
                dismissAlert();
              }}
              variant="default"
              className="flex-1"
            >
              {alert.action.label}
            </Button>
          )}
          <Button
            onClick={dismissAlert}
            variant="outline"
            className="flex-1"
          >
            {alert.action ? 'Dismiss' : 'OK'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
