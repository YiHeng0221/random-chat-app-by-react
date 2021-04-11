const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  userJoinRoom,
  getUserCounts,
} = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "localhost:3000/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use(cors());
app.options("*", cors());
app.use(router);

io.on("connection", (socket) => {
  let counts;
  console.log("we have a new connection!!");
  console.log(socket.id);

  socket.on("login", ({ name }) => {
    const { error, user } = addUser({ id: socket.id, name });
    if (user) {
      socket.emit("userInfo", user);
      console.log("login", user);
    } else {
      socket.emit("error", error);
    }
  });

  socket.on("getUsersCountInRoom", () => {
    counts = getUserCounts();
    socket.emit("counts", counts);
  });

  socket.on("join", ({ userInfo, roomInfo }, callback) => {
    const { err, user } = userJoinRoom(userInfo, roomInfo);
    if (err) return callback(err);
    console.log("join", user);

    socket.emit("message", {
      user: "admin",
      text: `${user.userInfo.name}, welcome to the room ${user.roomInfo.room}`,
    }); // 加入後 admin 會向 user 發送該訊息

    socket.broadcast.to(user.roomInfo.room).emit("message", {
      user: "admin",
      text: `${user.userInfo.name}, has joined the room ${user.roomInfo.room}`,
    }); // 告訴 room 中所有人

    socket.join(user.roomInfo.room);
  });

  socket.on("sendMessage", ({ message, userInfo, roomInfo }) => {
    console.log("whoSend", { message, userInfo, roomInfo });
    io.to(roomInfo.room).emit("message", {
      user: userInfo.name,
      text: message,
    });
  });

  socket.on("exitRoom", ({ userInfo, roomInfo }) => {
    console.log({ userInfo, roomInfo });
    const user = removeUser(userInfo, roomInfo);
    if (user) {
      io.to(roomInfo.room).emit("adminMessage", {
        user: "admin",
        text: `${userInfo.name} has left.`,
      });
    }
    socket.leave(roomInfo.room);
  });
});

server.listen(PORT, () => {
  console.log(`server has started on port: ${PORT} `);
});
