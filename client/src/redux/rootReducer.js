import { combineReducers } from "redux";
import AuthReducer from "./auth/AuthReducer";

// create root reducer
const rootReducer = combineReducers({
  auth: AuthReducer,
});

export default rootReducer;
