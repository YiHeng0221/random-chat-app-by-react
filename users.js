const users = [];
const usersInRoom = [];

const addUser = ({ id, name }) => {
  name = name.trim().toLowerCase();

  const existingUser = users.find((user) => user.name === name);
  if (existingUser) {
    return { error: "Username is taken" };
  }
  const user = { id, name };

  users.push(user);
  return { user };
};

const getUserCounts = () => {
  return {
    lobbyCounts: usersInRoom.filter((user) => user.roomInfo.mode === "lobby")
      .length,
    passwordCounts: usersInRoom.filter(
      (user) => user.roomInfo.mode === "password"
    ).length,
    randomCounts: usersInRoom.filter((user) => user.roomInfo.mode === "random")
      .length,
  };
};

const userJoinRoom = (userInfo, roomInfo) => {
  const user = { userInfo, roomInfo };
  console.log("userJoinRoom", user);
  console.log("allusers", users);
  usersInRoom.push(user);
  console.log("joinroomusers", usersInRoom);
  return { user };
};

const removeUser = (userInfo, roomInfo) => {
  console.log(userInfo, roomInfo);
  usersInRoom.filter((user) => user.userInfo.id === userInfo.id);
  return usersInRoom;
};

const getUser = (id) => {
  usersInRoom.find((user) => {
    return user.userInfo.id === id;
  });
};

const getUsersInRoom = (room) => {
  users.filter((user) => {
    user.room === room;
  });
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  userJoinRoom,
  getUserCounts,
};
