import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios_instance } from '../../utils/axios';
import { showToast } from '../../utils/toast';

const initialState = {
    projects: [],
    allProjects: [],
    detail: null,
    timesheet: null,
};

export const getProjects = createAsyncThunk('getProjects', async (_, thunkAPI) => {
    try {
        const { data } = await axios_instance('/users/my-projects');
        return data.data;
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const getAllProjects = createAsyncThunk('getAllProjects', async (_, thunkAPI) => {
    try {
        const { data } = await axios_instance(`/projects?search=&page=&limit=9999`);

        return data.data.projects;
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const getProject = createAsyncThunk('getProject', async (slug, thunkAPI) => {
    try {
        const { data } = await axios_instance(`/projects/${slug}`);
        return data.data;
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const getTimesheet = createAsyncThunk('getTimesheet', async (slug, thunkAPI) => {
    try {
        const { data } = await axios_instance(`/projects/${slug}/timesheet`);
        return data.data;
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const addProject = createAsyncThunk('addProject', async (formData, thunkAPI) => {
    try {
        const { data } = await axios_instance.post(`/projects/create-project`, formData);
        return data.data;
    } catch (error) {
        console.dir(error);
        return thunkAPI.rejectWithValue({ error: error.response.data.message });
    }
});

export const deleteProject = createAsyncThunk('deleteProject', async (slug, thunkAPI) => {
    try {
        const { data } = await axios_instance.delete(`projects/${slug}`);
        return slug;
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const updateProject = createAsyncThunk('updateProject', async ({ slug, oldData, formData }, thunkAPI) => {
    try {
        formData.managerId = oldData.manager._id;
        formData.leadersId = oldData.leaders.map((leader) => leader._id);
        formData.membersId = oldData.members.map((member) => member._id);
        const response = await axios_instance.put(`projects/${slug}`, formData);
        const { data } = await axios_instance.get(`projects/${response.data.data.updatedProject.slug}`);
        return data.data;
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const addMember = createAsyncThunk('addMember', async ({ preUpdateData, formData }, thunkAPI) => {
    let roleId = formData.role.value;
    try {
        preUpdateData[`${roleId}Id`].push(formData.userId.value);
        await axios_instance.put(`projects/${preUpdateData.slug}`, preUpdateData);

        await getTimesheet();

        const { data } = await axios_instance.get(`projects/${preUpdateData.slug}`);
        return { data, roleId };
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const addSummary = createAsyncThunk('addSummary', async ({ _data: data, slug }, thunkAPI) => {
    try {
        await axios_instance.post(`/projects/${slug}/summary`, data);
        const _data = await axios_instance.get(`projects/${slug}`);
        return _data.data.data;
    } catch (error) {
        console.dir(error);
        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const uploadExcel = createAsyncThunk('uploadExcel', async ({ data, slug }, thunkAPI) => {
    try {
        await axios_instance.post(`/projects/${slug}/summary/upload`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const _data = await axios_instance(`projects/${slug}`);
        return _data.data.data;
    } catch (error) {
        console.dir(error);
        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const uploadTimesheet = createAsyncThunk('uploadTimesheet', async ({ data, slug }, thunkAPI) => {
    try {
        await axios_instance.post(`/projects/${slug}/timesheet/upload-file`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const _data = await axios_instance(`/projects/${slug}/timesheet`);
        return _data.data.data;
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const reviewTimesheet = createAsyncThunk('reviewTimesheet', async ({ data, slug }, thunkAPI) => {
    try {
        await axios_instance.put(`/projects/${slug}/timesheet/review`, data);
        const _data = await axios_instance(`/projects/${slug}/timesheet`);
        return _data.data.data;
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const removeFileFromTimesheet = createAsyncThunk('removeFileFromTimesheet', async ({ data, slug }, thunkAPI) => {
    try {
        await axios_instance.post(`/projects/${slug}/timesheet/delete-file`, { data: data });
        const _data = await axios_instance(`/projects/${slug}/timesheet`);
        return _data.data.data;
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const leaveMembers = createAsyncThunk('leaveMembers', async ({ data, slug }, thunkAPI) => {
    try {
        await axios_instance.put(`/projects/${slug}/timesheet/leave-members`, data);
        const _data = await axios_instance(`/projects/${slug}/timesheet`);
        return _data.data.data;
    } catch (error) {
        console.dir(error);
        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const deleteMember = createAsyncThunk('deleteMember', async ({ preUpdateData, member, roleId }, thunkAPI) => {
    try {
        let memIndex = preUpdateData[`${roleId}Id`].indexOf(member._id);
        preUpdateData[`${roleId}Id`].splice(memIndex, 1);
        await axios_instance.put(`projects/${preUpdateData.slug}`, preUpdateData);

        const { data } = await axios_instance.get(`projects/${preUpdateData.slug}`);
        return { data, roleId };
    } catch (error) {
        console.dir(error);

        return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
});

export const changeMemberRole = createAsyncThunk(
    'changeMemberRole',
    async ({ preUpdateData, member, roleId, toRoleId }, thunkAPI) => {
        try {
            if (roleId !== 'manager') {
                let memIndex = preUpdateData[`${roleId}Id`].indexOf(member._id);
                preUpdateData[`${roleId}Id`].splice(memIndex, 1);
            } else {
                preUpdateData[`managerId`] = '';
            }
            if (toRoleId === 'manager') {
                preUpdateData.leadersId.push(preUpdateData.managerId);
                preUpdateData.managerId = member._id;
            } else {
                preUpdateData[`${toRoleId}Id`].push(member._id);
            }

            await axios_instance.put(`projects/${preUpdateData.slug}`, preUpdateData);

            const { data } = await axios_instance.get(`projects/${preUpdateData.slug}`);
            return { data, roleId };
        } catch (error) {
            console.dir(error);

            return thunkAPI.rejectWithValue({ error: error.response.data.error });
        }
    },
);

export const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        toggleLoading: (state) => {
            state.loading = !state.loading;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addProject.fulfilled, (state, { payload }) => {
            state.projects.push(payload.newProject);
            showToast('success', 'Tạo dự án thành công!');
        });
        builder.addCase(addProject.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', payload.error);
        });

        builder.addCase(deleteProject.fulfilled, (state, { payload }) => {
            state.projects = state.projects.filter((project) => project.slug !== payload);
            state.detail = null;
        });
        builder.addCase(deleteProject.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi xoá dự án!');
        });

        builder.addCase(updateProject.fulfilled, (state, { payload }) => {
            console.log(payload);
            state.detail = payload.project;
        });
        builder.addCase(updateProject.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi cập nhật dự án!');
        });

        builder.addCase(getProjects.fulfilled, (state, { payload }) => {
            state.projects = payload.projects;
        });
        builder.addCase(getProjects.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi tải dự án!');
        });

        builder.addCase(getAllProjects.fulfilled, (state, { payload }) => {
            state.allProjects = payload;
        });
        builder.addCase(getAllProjects.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi tải tất cả dự án!');
        });

        builder.addCase(getProject.fulfilled, (state, { payload }) => {
            state.detail = payload.project;
        });
        builder.addCase(getProject.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi tải dự án!');
        });

        builder.addCase(getTimesheet.fulfilled, (state, { payload }) => {
            state.timesheet = payload.project.timesheets;
        });
        builder.addCase(getTimesheet.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi tải timesheet!');
        });

        builder.addCase(addMember.fulfilled, (state, { payload }) => {
            let role = payload.roleId;
            let data = payload.data.data.project;

            state.detail[role] = [...data[role]];
        });

        builder.addCase(addMember.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi thêm thành viên!');
        });

        builder.addCase(addSummary.fulfilled, (state, { payload }) => {
            state.detail = payload.project;
            showToast('success', 'Lưu tổng kê thành công!');
        });

        builder.addCase(addSummary.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi lưu tổng kê!');
        });

        builder.addCase(uploadExcel.fulfilled, (state, { payload }) => {
            state.detail = payload.project;
            showToast('success', 'Tải lên tệp Excel thành công!');
        });

        builder.addCase(uploadExcel.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi tải lên tệp!');
        });

        builder.addCase(uploadTimesheet.fulfilled, (state, { payload }) => {
            state.timesheet = payload.project.timesheets;
            showToast('success', 'Tải lên tệp thành công!');
        });

        builder.addCase(uploadTimesheet.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi tải lên tệp!');
        });

        builder.addCase(reviewTimesheet.fulfilled, (state, { payload }) => {
            state.timesheet = payload.project.timesheets;
            showToast('success', 'Cập nhật thành công!');
        });

        builder.addCase(reviewTimesheet.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi cập nhật!');
        });

        builder.addCase(removeFileFromTimesheet.fulfilled, (state, { payload }) => {
            state.timesheet = payload.project.timesheets;
            showToast('success', 'Xóa tệp thành công!');
        });

        builder.addCase(removeFileFromTimesheet.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi xóa tệp!');
        });

        builder.addCase(leaveMembers.fulfilled, (state, { payload }) => {
            state.timesheet = payload.project.timesheets;
            showToast('success', 'Cập nhật thành công!');
        });

        builder.addCase(leaveMembers.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi khi cập nhật!');
        });

        builder.addCase(deleteMember.fulfilled, (state, { payload }) => {
            let role = payload.roleId;
            let data = payload.data.data.project;

            state.detail[role] = [...data[role]];
        });

        builder.addCase(deleteMember.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi xoá thành viên!');
        });

        builder.addCase(changeMemberRole.fulfilled, (state, { payload }) => {
            let data = payload.data.data.project;

            state.detail = data;
        });

        builder.addCase(changeMemberRole.rejected, (_, { payload }) => {
            console.log(payload);
            showToast('error', 'Lỗi xoá thành viên!');
        });
    },
});

export const { toggleLoading, clearLogin } = projectSlice.actions;

export default projectSlice.reducer;
