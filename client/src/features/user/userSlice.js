import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Cookies from 'universal-cookie';
import { axios } from '../../utils/axios';
import { showToast } from '../../utils/toast';

const initialState = {
  isLoading: true,
  auth: null,
  systemUsers: [],
  detail: null,
};

export const login = createAsyncThunk('login', async (formData, thunkAPI) => {
  try {
    const { data } = await axios.post('/auth/signin', formData);
    return data;
  } catch (error) {
    console.dir(error);
    return thunkAPI.rejectWithValue({ error: error.response.data.message });
  }
});

export const getMe = createAsyncThunk('getMe', async (_, thunkAPI) => {
  try {
    const cookies = new Cookies();
    const slug = cookies.get('user-slug');
    const { data } = await axios(`/users/${slug}`);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.response.data.error });
  }
});

export const getUsers = createAsyncThunk(
  'getUsers',
  async (thunkAPI) => {
    try {
      const { data } = await axios(`users?search=&job_title=&page=&limit=9999`);
      return data.data.users;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
  },
);

export const getUser = createAsyncThunk('getUser', async (slug, thunkAPI) => {
  try {
    const { data } = await axios(`users/${slug}`);
    return data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.response.data.error });
  }
});

export const createUser = createAsyncThunk(
  'createUser',
  async (formData, thunkAPI) => {
    try {
      const { data } = await axios.post(`users/create`, formData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.response.data.message });
    }
  },
);

export const updateUser = createAsyncThunk(
  'updateUser',
  async (formData, thunkAPI) => {
    try {
      const { data } = await axios.put(`users/${formData.slug}/edit-account`, formData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.response.data.message });
    }
  },
);

export const updateUserSecurity = createAsyncThunk(
  'updateUserSecurity',
  async ({ self, slug, formData }, thunkAPI) => {
    try {
      const { data } = await axios.put(`users/${slug}/edit-security`, formData);
      return { data, self };
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.response.data.message });
    }
  },
);

export const deleteUser = createAsyncThunk(
  'deleteUser',
  async ({ slug, password }, thunkAPI) => {
    try {
      await axios.post(`users/${slug}/delete`, { data: { 'confirmPassword': password } });
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.response.data.message });
    }
  },
);

export const forceDeleteUser = createAsyncThunk(
  'forceDeleteUser',
  async ({ slug, password }, thunkAPI) => {
    try {
      await axios.post(`users/${slug}/force-delete`, { data: { 'confirmPassword': password } });
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.response.data.message });
    }
  },
);

export const restoreUser = createAsyncThunk(
  'restoreUser',
  async ({ slug, password }, thunkAPI) => {
    try {
      await axios.patch(`/users/${slug}/restore`, { 'confirmPassword': password });
      const { data } = await axios(`users?search=&job_title=&page=&limit=9999`);
      return data.data.users;
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.response.data.message });
    }
  },
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    toggleLoading: (state) => {
      state.loading = !state.loading;
    },
    clearLogin: (state) => {
      state.isLoading = false;
      state.auth = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.auth = payload.data.user;
    });
    builder.addCase(login.rejected, (state, { payload }) => {
      state.isLoading = false;
      showToast('error', `${payload.error}.`);
    });
    builder.addCase(getMe.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.auth = payload.data.user;
    });
    builder.addCase(getMe.rejected, (state) => {
      state.isLoading = false;
      state.auth = null;
    });
    builder.addCase(getUsers.fulfilled, (state, { payload }) => {
      state.systemUsers = payload;
    });
    builder.addCase(getUsers.rejected, (_, { payload }) => {
      console.log(payload);
      showToast('error', 'Lỗi khi tải thành viên!');
    });
    builder.addCase(getUser.fulfilled, (state, { payload }) => {
      state.detail = payload.user;
    });
    builder.addCase(getUser.rejected, (_, { payload }) => {
      console.log(payload);
      // showToast('error', 'Lỗi khi tải thành viên!');
    });

    builder.addCase(createUser.fulfilled, (_, { payload }) => {
      showToast('success', `Tạo tài khoản thành công!`,
      );
    });
    builder.addCase(createUser.rejected, (_, { payload }) => {
      console.log(payload)
      showToast('error', `${(payload.error)}`,
      );
    });


    builder.addCase(updateUser.fulfilled, (state, { payload }) => {
      state.detail = payload.data.updatedUser;

      if (payload.data.updatedUser._id === state.auth._id) {
        state.auth = { ...state.auth, ...payload.data.updatedUser };
      }

      showToast('success', 'Cập nhật thành công!');
    });
    builder.addCase(updateUser.rejected, (_, { payload }) => {
      showToast('error', `Lỗi khi cập nhật! ${payload.error}`);
    });


    builder.addCase(updateUserSecurity.fulfilled, (state, { payload }) => {
      showToast('success', 'Đổi mật khẩu thành công!');

      if (payload.self) {
        window.location.href = '/'
      }
    });
    builder.addCase(updateUserSecurity.rejected, (_, { payload }) => {
      showToast('error', `${payload.error}`);
    });


    builder.addCase(deleteUser.fulfilled, (state, { payload }) => {
      showToast('success', 'Xoá tài khoản thành công!');
    });
    builder.addCase(deleteUser.rejected, (_, { payload }) => {
      showToast('error', payload.error);
    });

    builder.addCase(forceDeleteUser.fulfilled, (state, { payload }) => {
      showToast('success', 'Đã xóa vĩnh viễn tài khoản!');
    });
    builder.addCase(forceDeleteUser.rejected, (_, { payload }) => {
      showToast('error', payload.error);
    });

    builder.addCase(restoreUser.fulfilled, (state, { payload }) => {
      state.systemUsers = payload;
      showToast('success', 'Khôi phục tài khoản thành công!');
    });
    builder.addCase(restoreUser.rejected, (_, { payload }) => {
      showToast('error', payload.error);
    });
  },
});

export const { toggleLoading, clearLogin } = userSlice.actions;

export default userSlice.reducer;
