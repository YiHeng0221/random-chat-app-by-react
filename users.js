let users = [];
let usersInLobby = [];
let usersInPassword = [];
let usersInRandom = [];
let passwordRooms = [];
let randomRooms = [];

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
    lobbyCounts: usersInLobby.length,
    passwordCounts: usersInPassword.length,
    randomCounts: usersInRandom.length,
  };
};

const userJoinRoom = (userInfo, roomInfo) => {
  const user = { userInfo, roomInfo };
  let roomArray;
  switch (roomInfo.mode) {
    case "lobby":
      usersInLobby.push(user);
      return (roomArray = usersInLobby);
    case "password":
      usersInPassword.push(user);
      return (roomArray = usersInPassword);
    case "random":
      usersInRandom.push(user);
      return (roomArray = usersInRandom);
    default:
      break;
  }
};

const removeUserFromRoom = (userInfo, roomInfo) => {
  if (roomInfo.mode === "lobby") {
    usersInLobby = usersInLobby.filter(
      (user) => user.userInfo.id !== userInfo.id
    );
    return usersInLobby;
  } else if (roomInfo.mode === "password") {
    usersInPassword = usersInPassword.filter(
      (user) => user.userInfo.id !== userInfo.id
    );
    return usersInPassword;
  } else {
    usersInRandom = usersInRandom.filter(
      (user) => user.userInfo.id !== userInfo.id
    );
    return usersInRandom;
  }
};

const removeUser = (userInfo) => {
  users = users.filter((user) => {
    user.id !== userInfo.id;
  });
  return users;
};

const getUser = (id) => {
  usersInRoom.find((user) => {
    return user.userInfo.id === id;
  });
};

const isNobodyInside = (roomInfo) => {
  const findInPassword = usersInPassword.find(
    (user) => user.roomInfo.room === roomInfo.room
  );

  const findInRandom = usersInRandom.find(
    (user) => user.roomInfo.room === roomInfo.room
  );
  if (roomInfo.mode === "password") {
    if (!findInPassword) {
      passwordRooms.splice(roomInfo.room);
    }
  }
  if (roomInfo.mode === "random") {
    if (!findInRandom) {
      randomRooms = randomRooms.filter((room) => room.room !== roomInfo.room);
    }
  }
};

// password
const isPasswordRoomExist = (password) => {
  if (passwordRooms.find((room) => room === password)) {
    return true;
  } else {
    return false;
  }
};

const addPasswordRoom = (password) => {
  passwordRooms.push(password);
};

// random
const getRandomRoomNum = () => {
  const avaliableRoom = randomRooms.find((randomRoom) => randomRoom.flag === 0);
  if (!avaliableRoom) {
    const nums = Math.floor(Math.random() * 10000).toString();
    randomRooms.push({ room: nums, flag: 0 });
    return nums;
  } else {
    avaliableRoom.flag = 1;
    return avaliableRoom.room;
  }
};

module.exports = {
  getRandomRoomNum,
  isPasswordRoomExist,
  addPasswordRoom,
  addUser,
  removeUserFromRoom,
  removeUser,
  getUser,
  userJoinRoom,
  getUserCounts,
  isNobodyInside,
};
