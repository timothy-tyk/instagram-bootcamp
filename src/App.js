import React from "react";
import {
  onChildAdded,
  onChildChanged,
  push,
  ref,
  set,
  update,
} from "firebase/database";
import { database, storage, auth } from "./firebase";
import logo from "./logo.png";
import Registration from "./Registration";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  getDownloadURL,
  ref as storageReference,
  uploadBytes,
} from "firebase/storage";
import Comments from "./Comments";
import Likes from "./Likes";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Container } from "@mui/system";
import NewPost from "./NewPost";

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
      comment: "",
      showRegistration: true,
      useremail: "",
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
    // onChildChanged(messagesRef, (data) => {
    //   this.setState((state) => ({
    //     messages: [...state.messages, { key: data.key, val: data.val() }],
    //   }));
    // });
  }

  // Note use of array fields syntax to avoid having to manually bind this method to the class

  writeData = (url) => {
    let timeStamp = new Date().toLocaleString();
    const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
    const newMessageRef = push(messageListRef);
    set(newMessageRef, {
      date: timeStamp,
      user: this.state.useremail,
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

  updateLikes = (item, i) => {
    const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
    const updates = {};
    let newData = {
      date: item.val.date,
      user: item.val.user,
      imageurl: item.val.imageurl,
      likes: item.val.likes + 1,
      message: item.val.message,
      comments: item.val.comments,
    };
    updates[item.key] = newData;
    update(messageListRef, updates).then(() => {
      console.log("data updated!");
    });
    let newArray = this.state.messages;
    newArray[i].val = newData;
    this.setState({ messages: newArray });
  };

  addComment = (item, i, comment) => {
    if (comment !== "") {
      const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
      const updates = {};
      let newData = {
        date: item.val.date,
        user: item.val.user,
        imageurl: item.val.imageurl,
        likes: item.val.likes,
        message: item.val.message,
        comments: [
          ...item.val.comments,
          { text: comment, user: this.state.useremail },
        ],
      };
      updates[item.key] = newData;
      update(messageListRef, updates).then(() => {
        console.log("comment added!");
      });
      let newArray = this.state.messages;
      newArray[i].val = newData;
      this.setState({ messages: newArray });
    }
  };

  signup = (e, email, password) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password).then(
      console.log("successfully signed up")
    );
  };

  login = (e, email, password) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => this.setState({ showRegistration: false, useremail: email }))
      .catch((err) => console.log(err));
  };

  logout = () => {
    signOut(auth);
    console.log("logged out");
    this.setState({ showRegistration: true, useremail: "" });
  };

  componentDidUpdate(prevState) {
    if (this.state.messages !== prevState.messages) {
      console.log("CDU: updated ");
      // const messagesRef = ref(database, MESSAGE_FOLDER_NAME);
      // onChildChanged(messagesRef, (data) => {
      //   console.log(data);
      // });
    }
  }
  render() {
    // Convert messages in state to message JSX elements to render
    let messageListItems = this.state.messages.map((message, index) => (
      <li key={message.key} className="feed">
        Post: {message.val.message} | <i>{message.val.date}</i> | By:{" "}
        {message.val.user}
        <Likes
          likes={message.val.likes}
          handleClick={() => this.updateLikes(message, index)}
        />
        <br />
        <img className="images" src={message.val.imageurl} alt="" />
        <br />
        <Comments
          messageItem={message}
          handleClick={(comment, user) =>
            this.addComment(message, index, comment)
          }
        />
        <br />
      </li>
    ));

    //MUI theme
    const theme = createTheme({
      palette: {
        mode: "dark",
      },
      typography: {
        color: "white",
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              height: "56px",
              color: "white",
              border: " solid 0.5px white",
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              minWidth: "25vw",
              backgroundColor: "transparent",
              border: "0.5px solid white",
              margin: "25 0",
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              display: "flex",
            },
          },
        },
        MuiContainer: {
          styleOverrides: {
            root: {
              width: "90vw",
            },
          },
        },
        MuiToolbar: {
          styleOverrides: {
            root: {
              display: "flex",
            },
          },
        },
      },
    });

    return (
      <div className="App">
        <header className="App-header">
          <ThemeProvider theme={theme}>
            {this.state.showRegistration ? (
              <Registration
                handleSignup={this.signup}
                handleLogin={this.login}
              />
            ) : (
              <Container>
                <AppBar position="static">
                  <Toolbar>
                    <Typography style={{ flex: 1, textAlign: "left" }}>
                      RocketGram!
                    </Typography>
                    <Typography>{this.state.useremail} </Typography>
                    <Button
                      className="logoutbutton"
                      type="submit"
                      variant="outlined"
                      onClick={() => this.logout()}
                    >
                      Logout
                    </Button>
                  </Toolbar>
                </AppBar>
                <form>
                  <input
                    type="text"
                    onChange={(e) =>
                      this.setState({ inputMessage: e.target.value })
                    }
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
                {/* <NewPost
                  handleSendMessage={(e, user) => this.writeData("", user)}
                  handleUploadImage={(e) => this.uploadImage(e)}
                  user={this.state.useremail}
                /> */}
                <ol>{messageListItems}</ol>
                {/* <input
                type="submit"
                value="Logout"
                onClick={() => this.logout()}
              /> */}
              </Container>
            )}
          </ThemeProvider>
        </header>
      </div>
    );
  }
}

export default App;
