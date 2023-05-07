import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Link, Navigate } from 'react-router-dom';
import { axios } from '../utils/axios';
import { showToast } from '../utils/toast';

const getProjects = ({ queryKey }) => {
  let url;
  if (queryKey[1]) {
    if (queryKey[1] === 'all')
      url = '/projects?search=&limit=9999'
    else
      url = `/projects/${queryKey[1]}`
  }
  else
    url = '/users/my-projects'

  return axios(url);
};

export const useProjects = (keyword) => {
  return useQuery(['projects', keyword], getProjects, {
    onError: () => {
      showToast('error', 'Lỗi khi tải dự án');
    },
    staleTime: Infinity,
    select: ({ data }) => {
      return data.data.projects.map((workContent) => workContent);
    },
  });
};

export const useAddProject = () => {
  const queryClient = useQueryClient();

  return useMutation('add-project', (data) => axios.post('/projects/create-project', data), {
    onSuccess: () => {
      showToast('success', 'Đã thêm dự án');
      queryClient.invalidateQueries(['projects']);
    },
    onError: ({response}) => {
      showToast('error', response.data.message);
    },
  });
};