const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const {
  getRandomRoomNum,
  isPasswordRoomExist,
  addPasswordRoom,
  addUser,
  removeUserFromRoom,
  removeUser,
  userJoinRoom,
  getUserCounts,
  isNobodyInside,
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
  let objUserInfo;
  let objRoomInfo;
  socket.on("login", (name) => {
    const { error, user } = addUser({ id: socket.id, name });
    objUserInfo = { id: socket.id, name };
    if (user) {
      socket.emit("userInfo", user);
    } else {
      socket.emit("error", error);
    }
  });

  socket.on("getCount", () => {
    const counting = setInterval(() => {
      counts = getUserCounts();
      socket.emit("counts", counts);
    }, 1000);
    socket.on("stopGetCount", () => {
      clearInterval(counting);
    });
  });

  // 密語聊天
  socket.on("sendPassword", (password) => {
    if (isPasswordRoomExist(password)) {
      setTimeout(
        () => socket.emit("isPasswordRoomExist", { boolean: true, password }),
        2000
      );
    } else {
      setTimeout(
        () => socket.emit("isPasswordRoomExist", { boolean: false, password }),
        2000
      );
    }
  });

  socket.on("addPasswordRoom", (password) => {
    addPasswordRoom(password);
  });

  // 隨機聊天
  socket.on("randomChatSelect", () => {
    const randomRoomNum = getRandomRoomNum();
    socket.emit("randomRoomNum", randomRoomNum);
  });

  socket.on("join", ({ userInfo, roomInfo }) => {
    userJoinRoom(userInfo, roomInfo);
    if (roomInfo.mode !== "random") {
      if (userInfo.id && roomInfo.room) {
        socket.emit("message", {
          user: "admin",
          text: `${userInfo.name}您好，歡迎來到${roomInfo.room}聊天室`,
        });
        socket.broadcast.to(roomInfo.room).emit("message", {
          user: "admin",
          text: `${userInfo.name}已經加入${roomInfo.room}聊天室`,
        });
      }
    } else {
      socket.emit("message", {
        user: "admin",
        text: `您好，歡迎來到匿名聊天室`,
      });
    }
    objRoomInfo = roomInfo;
    socket.join(roomInfo.room);
  });

  socket.on("sendMessage", ({ message, userInfo, roomInfo }) => {
    io.to(roomInfo.room).emit("message", {
      user: userInfo.name,
      text: message,
    });
  });

  socket.on("leaveRoom", ({ userInfo, roomInfo }) => {
    removeUserFromRoom(userInfo, roomInfo);
    socket.leave(roomInfo.room);
    if (objRoomInfo && objRoomInfo.mode !== "lobby") {
      isNobodyInside(roomInfo);
    }
    if (userInfo.id) {
      if (objRoomInfo.mode !== "random") {
        io.to(roomInfo.room).emit("message", {
          user: "admin",
          text: `${userInfo.name}已離開聊天室`,
        });
      } else {
        io.to(roomInfo.room).emit("message", {
          user: "admin",
          text: `對方已離開聊天室`,
        });
      }
    }
  });
  socket.on("userLeft", (userInfo) => {
    if (!userInfo) return;
    removeUser(userInfo);
  });
  socket.on("disconnect", () => {
    if (objUserInfo) {
      if (objRoomInfo) {
        removeUserFromRoom(objUserInfo, objRoomInfo);
        socket.leave(objRoomInfo.room);
        if (objRoomInfo.mode !== "random") {
          io.to(objRoomInfo.room).emit("message", {
            user: "admin",
            text: `${JSON.stringify(objUserInfo.name)}已離線`,
          });
        } else {
          io.to(objRoomInfo.room).emit("message", {
            user: "admin",
            text: `對方已離線`,
          });
        }
      } else {
        removeUser(objUserInfo);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`server has started on port: ${PORT} `);
});
