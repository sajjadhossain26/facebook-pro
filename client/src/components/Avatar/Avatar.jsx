import React from "react";
import { useSelector } from "react-redux";

const Avatar = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <>
      <img
        src={
          user.profile_photo
            ? user.profile_photo
            : "https://cdn.pixabay.com/photo/2013/07/13/12/07/avatar-159236__340.png"
        }
        alt=""
      />
    </>
  );
};

export default Avatar;
