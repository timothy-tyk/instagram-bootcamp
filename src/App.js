import React from "react";
import { onChildAdded, push, ref, set } from "firebase/database";
import { database, storage } from "./firebase";
import logo from "./logo.png";
import "./App.css";
import {
  getDownloadURL,
  ref as storageReference,
  uploadBytes,
} from "firebase/storage";

// Save the Firebase message folder name as a constant to avoid bugs due to misspelling
const MESSAGE_FOLDER_NAME = "messages";
const IMAGES_FOLDER_NAME = "images";

class App extends React.Component {
  constructor(props) {
    super(props);
    // Initialise empty messages array in state to keep local state in sync with Firebase
    // When Firebase changes, update local state, which will update local UI
    this.state = {
      inputMessage: "",
      messages: [],
      fileInputFile: null,
      fileInputValue: "",
    };
  }

  componentDidMount() {
    const messagesRef = ref(database, MESSAGE_FOLDER_NAME);
    // onChildAdded will return data for every child at the reference and every subsequent new child
    onChildAdded(messagesRef, (data) => {
      // Add the subsequent child to local component state, initialising a new array to trigger re-render
      this.setState((state) => ({
        // Store message key so we can use it as a key in our list items when rendering messages
        messages: [...state.messages, { key: data.key, val: data.val() }],
      }));
    });
  }

  // Note use of array fields syntax to avoid having to manually bind this method to the class
  writeData = (url) => {
    let timeStamp = new Date().toLocaleString();
    const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
    const newMessageRef = push(messageListRef);
    set(newMessageRef, `${timeStamp}: ${this.state.inputMessage}`);
  };

  uploadImage = (e) => {
    e.preventDefault();
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
        // console.log("uploaded:", snapshot);
        // console.log(snapshot.ref)
        return getDownloadURL(snapshot.ref);
      })
      .then((url) => {
        console.log(url);
        return this.writeData(url);
      });

    this.setState({ fileInputValue: "" });
  };

  render() {
    // Convert messages in state to message JSX elements to render
    let messageListItems = this.state.messages.map((message) => (
      <li key={message.key}>{message.val}</li>
    ));
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          {/* TODO: Add input field and add text input as messages in Firebase */}
          <form>
            <input
              type="text"
              onChange={(e) => this.setState({ inputMessage: e.target.value })}
            />

            <input
              type="submit"
              value="Send Message"
              onClick={this.writeData}
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

          <ol>{messageListItems}</ol>
        </header>
      </div>
    );
  }
}

export default App;
