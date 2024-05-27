import moment from 'moment';

/**
 * @return {number} = fromDate - toDate
 */
export const diffDay = (fromDate = moment(), toDate = moment()) => {
  const from = fromDate ?? moment();
  const to = toDate ?? moment();
  return from.diff(to, 'd');
};

export const firstDayInMonth = (date = moment()) => {
  date.set({ date: 1 });
  return date;
};

export const lastDayInMonth = (date = moment()) => {
  date.set({ date: 1 }).add({ months: 1, days: -1 });
  return date;
};
