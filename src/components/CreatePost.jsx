import defaultAvatar from '../assets/default-avatar.jpg'
import { FaBold } from "react-icons/fa";
import { FaItalic } from "react-icons/fa";
import { FaUnderline } from "react-icons/fa";
import { FaStrikethrough } from "react-icons/fa";

function CreatePost(){

  function aplicarNegrito() {
    const selection = window.getSelection();

    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const strong = document.createElement("strong");

    strong.appendChild(range.extractContents());
    range.insertNode(strong);
  }

  return(
    <div className="createPost-container">
      <div className="user-info">
        <img
          src={defaultAvatar}
          alt="avatar"
          className='user-avatar'
        />
        <span className="user-name">NOME DE USUÁRIO</span>
      </div>

      <div className="post-input-area">
        <div
          className='post-input'
          contentEditable
          suppressContentEditableWarning
        ></div>

        <button className='post-btn'>Postar</button>
      </div>

      <div className="format-icons">
        <FaBold className='f-icon bold' onClick={aplicarNegrito}/>
        <FaItalic className='f-icon italic'/>
        <FaUnderline className='f-icon underline'/>
        <FaStrikethrough className='f-icon strikethrough'/>
      </div>
    </div>
  )
}

export default CreatePost