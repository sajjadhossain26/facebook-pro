import { useSelector } from "react-redux";
import HomeHeader from "../../components/HomeHeader/HomeHeader";
import Sidebar from "../../components/Sidebar/Sidebar";
import TimeLine from "../../components/TimeLine/TimeLine";
import Auth from "../Auth/Auth";

const Home = () => {
  const { loginState } = useSelector((state) => state.auth);
  return (
    <>
      {loginState ? (
        <>
          <HomeHeader />

          <div className="fb-home-body">
            <Sidebar />
            <TimeLine />
          </div>
        </>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default Home;
