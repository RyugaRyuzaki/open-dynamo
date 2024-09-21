import {BrowserRouter} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import CookieConsent from "react-cookie-consent";
import BaseRoute from "./BaseRoute";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <BaseRoute />
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        theme="light"
      />
      <CookieConsent
        location="bottom"
        buttonText="Sure man!!"
        cookieName="myAwesomeCookieName2"
        style={{background: "#2B373B"}}
        buttonStyle={{color: "#4e503b", fontSize: "13px"}}
        expires={150}
      >
        This website uses cookies to enhance the user experience.{" "}
        <span style={{fontSize: "10px"}}>This bit of text is smaller :O</span>
      </CookieConsent>
    </>
  );
}

export default App;
