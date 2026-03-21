import defaultAvatar from '../assets/default-avatar.jpg'
import UserInfo from './UserInfo'
import { FaBold } from "react-icons/fa";
import { FaItalic } from "react-icons/fa";
import { FaUnderline } from "react-icons/fa";
import { FaStrikethrough } from "react-icons/fa";

function CreatePost(){
  return(
    <div className="createPost-container">
      <UserInfo />

      <div className="post-input-area">
        <input type='text' placeholder='No que você está pensando?' className='post-input' />


      </div>

      <div className="button-area">
        <div className="format-icons">
          <FaBold className='f-icon bold' />
          <FaItalic className='f-icon italic'/>
          <FaUnderline className='f-icon underline'/>
          <FaStrikethrough className='f-icon strikethrough'/>
        </div>

        <button className='post-btn'>Postar</button>
      </div>

    </div>
  )
}

export default CreatePost