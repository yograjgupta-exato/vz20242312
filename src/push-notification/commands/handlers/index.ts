import { PushNotifyCustomerCancellationHandler } from './push-notify-customer-cancellation.handler';
import { PushNotifyCustomerRescheduledHandler } from './push-notify-customer-rescheduled.handler';
import { PushNotifyIncomingNewJobHandler } from './push-notify-incoming-new-job.handler';
import { PushNotifyJobAssignmentHandler } from './push-notify-job-assignment.handler';
import { PushNotifyScheduledJobReminderHandler } from './push-notify-scheduled-job-reminder.handler';

export const CommandHandlers = [
    PushNotifyCustomerCancellationHandler,
    PushNotifyIncomingNewJobHandler,
    PushNotifyJobAssignmentHandler,
    PushNotifyScheduledJobReminderHandler,
    PushNotifyCustomerRescheduledHandler,
];
