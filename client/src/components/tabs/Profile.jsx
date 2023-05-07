import { Box } from '@chakra-ui/react';
import React from 'react';
import { useSelector } from 'react-redux';
import AccountInfo from '../AccountInfo';
import ProfileInfo from '../ProfileInfo';

const Profile = ({ self = false }) => {
  const { slug, username, name, phoneNumber, email, job, address, role, status, gender, DOB, deleted, deletedBy } =
    useSelector((state) => {
      if (self) return state.user.auth;
      if (state.user.detail.slug === state.user.auth.slug) {
        self = true;
        return state.user.auth;
      }
      return state.user.detail
    });

  const { role: myRole } = useSelector((state) => state.user.auth);

  let jobId = job._id
  let jobName = job.name

  return (
    <Box>
      {(self || myRole === 'admin') && <AccountInfo self={self} data={{ username, slug, deleted, deletedBy }} status={status} />}
      <ProfileInfo
        data={{ slug, username, name, phoneNumber, email, jobId, jobName, address, role, gender, DOB, cantEdit: (self || myRole === 'admin') }}
      />
    </Box>
  );
};

export default Profile;
