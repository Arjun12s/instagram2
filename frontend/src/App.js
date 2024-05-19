import React,{useState} from 'react';
import './App.css';
import Navbar from './components/navbar';
import Message from './components/message';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Profile from './components/profile';
import Home from './components/home';
import Createpost from './components/Createpost';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoginContext } from './context/loginContext';
import Notify from './components/notification';
import Modal from './components/Modal';
import UserProfile from './components/UserProfile';
import MyFollowingPost from './components/MyFollowingPost';


function App() {
  const [userLogin,setuserLogin]=useState(false)
  const [modalOpen,setModalOpen]=useState(false)
  return (
    <BrowserRouter>
    <div className="App">
      <LoginContext.Provider value={{setuserLogin,setModalOpen}}>
    <Navbar login ={userLogin}/>

    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/signup' element={<SignUp/>}></Route>
      <Route path='/signin' element={<SignIn/>}></Route>
      <Route exact path='/profile' element={<Profile/>}></Route>
      <Route path='/message' element={<Message/>}></Route>
      <Route path ='/notification'element={<Notify/>}></Route>
      <Route path ='/followingpost'element={<MyFollowingPost/>}></Route>
      <Route path ='/profile/:userid'element={<UserProfile/>}></Route>
      

      <Route path='/createPost' element={<Createpost/>}></Route>
    </Routes>
  <ToastContainer/>
 {modalOpen && <Modal setModalOpen={setModalOpen}></Modal>}
  </LoginContext.Provider>
    </div>
    </BrowserRouter>
  );
}

export default App;
