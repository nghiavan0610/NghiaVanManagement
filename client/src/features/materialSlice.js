import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios_instance } from '../utils/axios';
import { showToast } from '../utils/toast';

const initialState = {
  isLoading: true,
  materials: [],
  detail: null,
};

const getMaterial = async (materialType) => {
  let url = `/materials?materialType=${materialType}&search=`;
  const { data } = await axios_instance(url)

  return data.data[materialType];
};

const getAllMaterials = async () => {
  const dayDans = await getMaterial("DayDan");
  const trus = await getMaterial("Tru");
  const mongs = await getMaterial("Mong");
  const das = await getMaterial("Da");
  const xaSus = await getMaterial("XaSu");
  const boChangs = await getMaterial("BoChang");
  const tiepDias = await getMaterial("TiepDia");
  const phuKiens = await getMaterial("PhuKien");
  const thietBis = await getMaterial("ThietBi");

  return { dayDans, trus, mongs, das, xaSus, boChangs, tiepDias, phuKiens, thietBis, }
};

export const getOneMaterialType = createAsyncThunk(
  'getOneMaterialType',
  async (materialType, thunkAPI) => {
    try {
      const matType = materialType.slice(0, -1).charAt(0).toUpperCase() + materialType.slice(0, -1).substring(1)
      const data = await getMaterial(matType);
      return { matType: materialType, data };
    } catch (error) {
      console.dir(error);
      return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
  },
);

export const getMaterials = createAsyncThunk(
  'getMaterials',
  async (thunkAPI) => {
    try {
      const data = await getAllMaterials();
      return data;
    } catch (error) {
      console.dir(error);
      return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
  },
);

export const addMaterial = createAsyncThunk(
  'addMaterial',
  async (formData, thunkAPI) => {
    try {
      const matType = formData.materialType
      formData.materialType = matType.slice(0, -1).charAt(0).toUpperCase() + matType.slice(0, -1).substring(1)
      await axios_instance.post(`/materials/create-material`, formData);
      const data = await getMaterial(formData.materialType)
      return { matType, data }
    } catch (error) {
      console.dir(error);
      return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
  },
);

export const editMaterial = createAsyncThunk(
  'editMaterial',
  async ({ matId, formData }, thunkAPI) => {
    try {
      const matType = formData.materialType
      formData.materialType = matType.slice(0, -1).charAt(0).toUpperCase() + matType.slice(0, -1).substring(1)
      await axios_instance.put(`/materials/${matId}`, formData);
      const data = await getMaterial(formData.materialType)
      return { matType, data }
    } catch (error) {
      console.dir(error);
      return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
  },
);

export const removeMaterial = createAsyncThunk(
  'removeMaterial',
  async ({ matId, formData }, thunkAPI) => {
    try {
      const matType = formData.materialType
      formData.materialType = matType.slice(0, -1).charAt(0).toUpperCase() + matType.slice(0, -1).substring(1)
      await axios_instance.delete(`/materials/${matId}`, { data: formData });
      const data = await getMaterial(formData.materialType)
      return { matType, data }
    } catch (error) {
      console.dir(error);
      return thunkAPI.rejectWithValue({ error: error.response.data.error });
    }
  },
);

export const materialSlice = createSlice({
  name: 'material',
  initialState,
  reducers: {
    toggleLoading: (state) => {
      state.loading = !state.loading;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getOneMaterialType.fulfilled, (state, { payload }) => {
      state.materials[payload.matType] = payload.data;
    });
    builder.addCase(getOneMaterialType.rejected, (_, { payload }) => {
      console.log(payload);
      showToast('error', 'Lỗi khi tải vật tư!');
    });
    builder.addCase(getMaterials.fulfilled, (state, { payload }) => {
      state.materials = payload;
      state.isLoading = false
    });
    builder.addCase(getMaterials.rejected, (_, { payload }) => {
      console.log(payload);
      showToast('error', 'Lỗi khi tải vật tư!');
    });

    builder.addCase(editMaterial.fulfilled, (state, { payload }) => {
      state.materials[payload.matType] = payload.data;
      showToast('success', 'Lưu vật tư thành công!');
    });
    builder.addCase(editMaterial.rejected, (_, { payload }) => {
      console.log(payload);
      showToast('error', 'Lỗi khi chỉnh sửa thông tin vật tư!');
    });

    builder.addCase(removeMaterial.fulfilled, (state, { payload }) => {
      state.materials[payload.matType] = payload.data;
      showToast('success', 'Đã xóa vật tư!');
    });
    builder.addCase(removeMaterial.rejected, (_, { payload }) => {
      console.log(payload);
      showToast('error', 'Lỗi khi xóa vật tư!');
    });

    builder.addCase(addMaterial.fulfilled, (state, { payload }) => {
      state.materials[payload.matType] = payload.data;
      showToast('success', 'Đã thêm vật tư!');
    });
    builder.addCase(addMaterial.rejected, (_, { payload }) => {
      console.log(payload);
      showToast('error', 'Lỗi khi thêm vật tư!');
    });
  },
});

export const { toggleLoading, clearLogin } = materialSlice.actions;

export default materialSlice.reducer;
