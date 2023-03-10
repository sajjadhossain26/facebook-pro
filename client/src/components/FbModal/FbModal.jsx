import React from "react";
import "./FbModal.css";

const FbModal = ({ children, title, closePopUp, back = null }) => {
  return (
    <>
      <div className="blur-box">
        <div className="fb-modal-wrap">
          <div className="fb-modal-popup">
            <div className="fb-modal-header">
              <div className="back-wrap">
                {back ? (
                  <i
                    class="fa-solid fa-arrow-left back"
                    onClick={() => back()}
                  ></i>
                ) : (
                  ""
                )}
              </div>
              <h4>{title}</h4>
              <div className="close-wrap">
                {closePopUp ? (
                  <i
                    class="fa-solid fa-xmark close"
                    onClick={() => closePopUp(false)}
                  ></i>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="fb-modal-body">{children}</div>
            <div className="fb-modal-footer"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FbModal;
