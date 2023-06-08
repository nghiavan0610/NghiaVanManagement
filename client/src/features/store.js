import { configureStore } from '@reduxjs/toolkit';
// import dateSlice from './date/dateSlice';
import projectSlice from './project/projectSlice';
import userSlice from './user/userSlice';
import materialSlice from './materialSlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    project: projectSlice,
    // date: dateSlice,
    material: materialSlice
  },
});
