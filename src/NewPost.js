import React from "react";
import { database, storage, auth } from "./firebase";
import {
  getDownloadURL,
  ref as storageReference,
  uploadBytes,
} from "firebase/storage";
import {
  onChildAdded,
  onChildChanged,
  push,
  ref,
  set,
  update,
} from "firebase/database";

const MESSAGE_FOLDER_NAME = "messages";
const IMAGES_FOLDER_NAME = "images";

export default class NewPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputMessage: "",
      fileInputFile: null,
      fileInputValue: "",
      user: this.props.user,
    };
  }

  writeData = (url, user) => {
    let timeStamp = new Date().toLocaleString();
    const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
    const newMessageRef = push(messageListRef);
    set(newMessageRef, {
      date: timeStamp,
      user: this.state.user,
      message: this.state.inputMessage,
      imageurl: url,
      likes: 0,
      comments: [{ text: "", user: "" }],
    });
    this.setState({ fileInputValue: "", inputMessage: "" });
  };

  uploadImage = (e, file, user) => {
    e.preventDefault();
    console.log(file);
    console.log(user);
    console.log(
      "uploading:",
      `${IMAGES_FOLDER_NAME}/${this.state.fileInputFile.name}`
    );
    const storageRef = storageReference(
      storage,
      `${IMAGES_FOLDER_NAME}/${this.state.fileInputFile.name}`
    );
    uploadBytes(storageRef, this.state.fileInputFile)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
      .then((url) => {
        return this.writeData(url);
      });
  };

  componentDidUpdate(prevState) {
    if (prevState.fileInputFile !== this.state.fileInputFile) {
      console.log("file added");
    }
  }

  render() {
    return (
      <div>
        <form>
          <input
            type="text"
            onChange={(e) => this.setState({ inputMessage: e.target.value })}
            value={this.state.inputMessage}
          />

          <input
            type="submit"
            value="Send Message"
            onClick={() => this.writeData("")}
          />
          <br />
          <input
            type="file"
            value={this.state.fileInputValue}
            onChange={(e) =>
              this.setState({
                fileInputFile: e.target.files[0],
                fileInputValue: e.target.value,
              })
            }
          />
          <input
            type="submit"
            value="Upload"
            onClick={(e) => {
              this.uploadImage(e);
            }}
          />
        </form>
      </div>
    );
  }
}
