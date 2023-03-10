import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFriend } from "../../../redux/auth/authAction";
import createToast from "../../../utility/toast";
import "./FriendBox.scss";

const FriendBox = ({ user, buttonState }) => {
  const { user: sender } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleAddFriend = (receiverId) => {
    dispatch(addFriend(receiverId, sender));
  };
  if (user) {
    return (
      <>
        <div className="friend_box">
          <div className="friend_box_wrap">
            <div className="friend_item">
              <img
                src={
                  user.profile_photo
                    ? `/profile/${user.profile_photo}`
                    : "https://cdn.pixabay.com/photo/2013/07/13/12/07/avatar-159236__340.png"
                }
                alt=""
              />
              <h3>
                {user.first_name} {user.sur_name}
              </h3>
              <div className="mutual_friend">
                <img
                  src="https://scontent.fcgp29-1.fna.fbcdn.net/v/t1.6435-1/147667373_711604826152100_7851734202176272995_n.jpg?stp=dst-jpg_p240x240&_nc_cat=105&ccb=1-7&_nc_sid=7206a8&_nc_eui2=AeFl7yR_wsg-lYAKVGJ-8MKv-itVlf3ej736K1WV_d6PvRPuNumhldo-OXy7DqzLVNJclxsZq_SFwaqqV82GwOGF&_nc_ohc=LB95Hxw5w3MAX9oEKRJ&_nc_ht=scontent.fcgp29-1.fna&oh=00_AfCU2z3ihJZ8_2NLVrwbpMt4HqOJV14BBN3Us9-g0s64zQ&oe=642E71FF"
                  alt=""
                />
                <img
                  src="https://scontent.fcgp29-1.fna.fbcdn.net/v/t1.6435-1/147667373_711604826152100_7851734202176272995_n.jpg?stp=dst-jpg_p240x240&_nc_cat=105&ccb=1-7&_nc_sid=7206a8&_nc_eui2=AeFl7yR_wsg-lYAKVGJ-8MKv-itVlf3ej736K1WV_d6PvRPuNumhldo-OXy7DqzLVNJclxsZq_SFwaqqV82GwOGF&_nc_ohc=LB95Hxw5w3MAX9oEKRJ&_nc_ht=scontent.fcgp29-1.fna&oh=00_AfCU2z3ihJZ8_2NLVrwbpMt4HqOJV14BBN3Us9-g0s64zQ&oe=642E71FF"
                  alt=""
                />

                <span>54 mutual friends</span>
              </div>
              <div className="action_button">
                {buttonState === "request" && (
                  <>
                    <button className="blue_btn full">Confirm</button>
                    <button className="gray_btn full">Delete</button>
                  </>
                )}
                {buttonState === "mayknow" && (
                  <>
                    <button
                      className="blue_2 full"
                      onClick={() => handleAddFriend(user._id)}
                    >
                      Add Friend
                    </button>
                    <button className="gray_btn full">Cancel</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default FriendBox;
