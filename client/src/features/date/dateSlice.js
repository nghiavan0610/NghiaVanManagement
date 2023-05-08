import { createSlice } from '@reduxjs/toolkit';
import { add, endOfMonth, format, startOfMonth, sub } from 'date-fns';
import viLocale from 'date-fns/locale/vi';
import { genericFormat } from '../../utils/Utils';

function getDates(startDate, stopDate) {
  const dateArray = [];
  let currentDate = startDate;

  while (currentDate <= stopDate) {
    const [dateInW, dayMonth] = format(currentDate, 'EEEEE-d/M', {
      locale: viLocale,
    }).split('-');

    dateArray.push({ dateInW, dayMonth });
    currentDate = add(currentDate, { days: 1 });
  }

  return dateArray;
}

const initialState = {
  endDate: genericFormat(new Date()),
  dates: getDates(sub(new Date(), { days: 9 }), new Date()),
  startMonth: genericFormat(startOfMonth(new Date())),
  endMonth: genericFormat(endOfMonth(new Date())),
  cacheDates: [genericFormat(new Date())],
};

export const dateSlice = createSlice({
  name: 'date',
  initialState,
  reducers: {
    setEndDate: (state, { payload }) => {
      state.endDate = genericFormat(payload);
      state.dates = getDates(sub(payload, { days: 9 }), payload);
      state.startMonth = genericFormat(startOfMonth(payload));
      state.endMonth = genericFormat(endOfMonth(payload));

      if (!state.cacheDates.includes(genericFormat(payload))) {
        state.cacheDates.push(genericFormat(payload));
      }
    },
  },
});

export const { setEndDate } = dateSlice.actions;

export default dateSlice.reducer;
