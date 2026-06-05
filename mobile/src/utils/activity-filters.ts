import type {Activity} from '../types';

function isVisibleActivity(activity: Activity) {
  return !activity.deletedAt && !activity.completedAt;
}

function filterVisibleActivities(activities: Activity[]) {
  return activities.filter(isVisibleActivity);
}

export {filterVisibleActivities, isVisibleActivity};
