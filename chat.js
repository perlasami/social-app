const { z } = window.Zod; 

const baseURL = "http://localhost:3000";
const token = `Bearer ${localStorage.getItem("token")}`;
let globalProfile = {};
const headers = {
  "Content-Type": "application/json; charset=UTF-8",
  authorization: token,
};
const clintIo = io(baseURL, {
  auth: { authorization: token },
});

clintIo.on("connect_error", (err) => {
  console.log("connect_error:", err.message);
});

clintIo.on("custom_error", (err) => {
  console.log(err);

  console.log("custom_error:", err.message);
});


clintIo.on("user_status", ({ userId, status }) => {
  console.log("User status:", userId, status);

  const statusEl = document.getElementById("status_" + userId);
  if (statusEl) {
    statusEl.innerHTML = status === "online" ? "🟢" : "⚫";
  }
});


clintIo.emit("sayHi", "FROM FE TO BE", (response) => {
  console.log({ response });
});
clintIo.on("sayHi", (data) => {
  console.log({ data });

});
clintIo.on("likePost", (data) => {
  console.log({ likeData: data });
});

//images links
let avatar = "./avatar/Avatar-No-Background.png";
let meImage = "./avatar/Avatar-No-Background.png";
let friendImage = "./avatar/Avatar-No-Background.png";

// // collect messageInfo


function sendMessage(sendTo, type) {
  console.log({ sendTo, type });


  const schema = z.object({
    content: z
      .string()
      .min(1, "Message cannot be empty")
      .max(500, "Message too long"),
  });

  const result = schema.safeParse({ content: $("#messageBody").val() });

  if (!result.success) {
    alert(result.error.errors[0].message);
    return;
  }

  const content = result.data.content;

  if (type === "ovo") {
    const data = { content, sendTo };
    console.log({ data });
    clintIo.emit("sendMessage", data);
  } else if (type === "group") {
    const data = { content, groupId: sendTo };
    clintIo.emit("sendGroupMessage", data);
  }

 
  $("#messageBody").val("");
}


// // // // //sendCompleted
clintIo.on("successMessage", (data) => {

  const content = data;
  console.log({ data });

  const div = document.createElement("div");

  div.className = "me text-end p-2";
  div.dir = "rtl";
  const imagePath = globalProfile.profilePicture
    ? `${baseURL}/upload/${globalProfile.profilePicture}`
    : avatar;

  div.innerHTML = `
    <img class="chatImage" src="${imagePath}" alt="" srcset="">
  <span class="mx-2">${content}</span>    `;

  document.getElementById("messageList").appendChild(div);
  $(".noResult").hide();
  $("#messageBody").val("");
});

// // // // // // // // //receiveMessage
clintIo.on("newMessage", (data) => {
  console.log({ RM: data });
  const { content, from, groupId } = data;
  console.log({ from });

  let imagePath = avatar;
  if (from?.profilePicture) {
    imagePath = `${baseURL}/upload/${from.profilePicture}`;
  }
  const onclickAttr = document
    .getElementById("sendMessage")
    .getAttribute("onclick");
  const [base, currentOpenedChat] =
    onclickAttr?.match(/sendMessage\('([^']+)'/) || [];
  console.log({ currentOpenedChat });
  console.log({ onclickAttr, currentOpenedChat });

  if (
    (!groupId && currentOpenedChat === from._id) ||
    (groupId && currentOpenedChat === groupId)
  ) {
    if (from._id.toString() != globalProfile._id.toString()) {
      const div = document.createElement("div");
      div.className = "myFriend p-2";
      div.dir = "ltr";
      div.innerHTML = `
    <img class="chatImage" src="${imagePath}" alt="" srcset="">
    <span class="mx-2">${content}</span>
    `;
      document.getElementById("messageList").appendChild(div);
    }
  } else {
    if (groupId) {
      $(`#g_${groupId}`).show();
    } else {
      $(`#c_${from._id}`).show();
    }
    const audio = document.getElementById("notifyTone");
    audio.currentTime = 0; // restart from beginning
    audio.play().catch((err) => console.log("Audio play blocked:", err));
  }
});

// // // ******************************************************************** Show chat conversation
function showData(sendTo, chat) {
  document
    .getElementById("sendMessage")
    .setAttribute("onclick", `sendMessage('${sendTo}' , "ovo")`);

  document.getElementById("messageList").innerHTML = "";
  console.log({ chat });

  if (chat?.message?.length) {
    console.log(1);

    $(".noResult").hide();
    for (const message of chat.message) {
      if (message.createdBy.toString() == globalProfile._id.toString()) {
        const div = document.createElement("div");
        div.className = "me text-end p-2";
        div.dir = "rtl";
        div.innerHTML = `
                <img class="chatImage" src="${meImage}" alt="" srcset="">
                <span class="mx-2">${message.content}</span>
                `;
        document.getElementById("messageList").appendChild(div);
      } else {
        const div = document.createElement("div");
        div.className = "myFriend p-2";
        div.dir = "ltr";
        div.innerHTML = `
                <img class="chatImage" src="${friendImage}" alt="" srcset="">
                <span class="mx-2">${message.content}</span>
                `;
        document.getElementById("messageList").appendChild(div);
      }
    }
  } else {
    const div = document.createElement("div");

    div.className = "noResult text-center  p-2";
    div.dir = "ltr";
    div.innerHTML = `
        <span class="mx-2">Say Hi to start the conversation.</span>
        `;
    document.getElementById("messageList").appendChild(div);
  }

  $(`#c_${sendTo}`).hide();
}

// // // // // // // //get chat conversation between 2 users and pass it to ShowData fun
function displayChatUser(userId) {
  console.log({ userId });
  axios({
    method: "get",
    url: `${baseURL}/api/v1/users/${userId}/chat`,
    headers,
  })
    .then(function (response) {
      console.log({ response });

      const chat = response.data.data;
      if (chat) {
        console.log(chat.participants[0]);
        console.log(typeof chat.participants[0]);

        if (
          chat.participants[0]._id.toString() == globalProfile._id.toString()
        ) {
          meImage = chat.participants[0].profilePicture
            ? `${baseURL}/upload/${chat.participants[0].profilePicture}`
            : avatar;
          friendImage = chat.participants[1].profilePicture
            ? `${baseURL}/upload/${chat.participants[1].profilePicture}`
            : avatar;
        } else {
          meImage = chat.participants[1].profilePicture
            ? `${baseURL}/upload/${chat.participants[1].profilePicture}`
            : avatar;
          friendImage = chat.participants[0].profilePicture
            ? `${baseURL}/upload/${chat.participants[0].profilePicture}`
            : avatar;
        }
        console.log("show messages");

        showData(userId, chat);
      } else {
        showData(userId, 0);
      }
    })
    .catch(function (error) {
      console.log(error);
      console.log({ status: error.status });
      if (error.status) {
        showData(userId, 0);
      } else {
        alert("Ops something went wrong");
      }
    });
}

// // // // ********************************************************************
// // // // ******************************************************************** Show  group chat conversation
function showGroupData(sendTo, chat) {
  document
    .getElementById("sendMessage")
    .setAttribute("onclick", `sendMessage('${sendTo}' , "group")`);

  document.getElementById("messageList").innerHTML = "";
  if (chat.messages?.length) {
    $(".noResult").hide();
    console.log(chat.messages);

    for (const message of chat.messages) {
      if (message.createdBy?._id.toString() == globalProfile._id.toString()) {
        const div = document.createElement("div");
        div.className = "me text-end p-2";
        div.dir = "rtl";
        div.innerHTML = `
                <img class="chatImage" src="${meImage}" alt="" srcset="">
                <span class="mx-2">${message.content}</span>
                `;
        document.getElementById("messageList").appendChild(div);
      } else {
        const div = document.createElement("div");
        div.className = "myFriend p-2";
        div.dir = "ltr";
        const friendImage = message.createdBy.profilePicture
          ? `${baseURL}/upload/${message.createdBy.profilePicture}`
          : avatar;
        div.innerHTML = `
                <img class="chatImage" src="${friendImage}" alt="" srcset="">
                <span class="mx-2">${message.content}</span>
                `;
        document.getElementById("messageList").appendChild(div);
      }
    }
  } else {
    const div = document.createElement("div");

    div.className = "noResult text-center  p-2";
    div.dir = "ltr";
    div.innerHTML = `
        <span class="mx-2">Say Hi to start the conversation.</span>
        `;
    document.getElementById("messageList").appendChild(div);
  }
  $(`#g_${sendTo}`).hide();
}
// // // // // // // ********************************************************************
function displayGroupChat(groupId) {
  console.log({ groupId });
  axios({
    method: "get",
    url: `${baseURL}/chat/group/${groupId}`,
    headers,
  })
    .then(function (response) {
      const { chat } = response.data?.data;
      console.log({ chat });
      if (chat) {
        meImage = globalProfile.profilePicture
          ? `${baseURL}/upload/${globalProfile.profilePicture}`
          : avatar;
        showGroupData(groupId, chat);
      } else {
        showGroupData(groupId, 0);
      }
    })
    .catch(function (error) {
      console.log(error);
      console.log({ status: error.status });
      if (error.status) {
        showGroupData(groupId, 0);
      } else {
        alert("Ops something went wrong");
      }
    });
}
// // // ==============================================================================================

// // ********************************************************* Show Users list
// Display Users
function getUserData() {
  console.log("start get user data");

  axios({
    method: "get",
    url: `${baseURL}/api/v1/users/profile`,
    headers,
  })
    .then(function (response) {
      console.log({ Response: response.data });

      const { user, groups } = response.data?.data;
      console.log({ user });

      globalProfile = user;
      let imagePath = avatar;
      if (user.profilePicture) {
        imagePath = `${baseURL}/upload/${user.profilePicture}`;
      }
      document.getElementById("profileImage").src = imagePath;
      document.getElementById("userName").innerHTML = `${user.firstName} ${user.lastName}`;

      showUsersData(user.friends);
      showGroupList(groups);
    })
    .catch(function (error) {
      console.log(error);
    });
}
// Show friends list
function showUsersData(users = []) {
  let cartonna = ``;
  for (let i = 0; i < users.length; i++) {
    let imagePath = avatar;
    if (users[i].profilePicture) {
      imagePath = `${baseURL}/upload/${users[i].profilePicture}`;
    }

    cartonna += `
      <div onclick="displayChatUser('${users[i]._id}')" class="chatUser my-2">
        <img class="chatImage" src="${imagePath}" alt="">
        <span class="ps-2">${users[i].firstName}</span>
        <span id="status_${users[i]._id}" class="ps-2">⚫</span>
      </div>
    `;
  }

  document.getElementById("chatUsers").innerHTML = cartonna;
}

//typing indicator
let typingTimeout;

// Emit typing event when user types
$("#messageBody").on("input", function () {
  const message = $(this).val();
  const onclickAttr = document.getElementById("sendMessage").getAttribute("onclick");
  const [_, sendTo] = onclickAttr?.match(/sendMessage\('([^']+)'/) || [];

  if (message.length > 0) {
    clintIo.emit("typing", { to: sendTo });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      clintIo.emit("stop_typing", { to: sendTo });
    }, 2000);
  } else {
    clintIo.emit("stop_typing", { to: sendTo });
  }
});

// Listen for typing events
clintIo.on("typing", ({ from }) => {
  const typingEl = document.getElementById("typingIndicator");
  if (typingEl) typingEl.style.display = "block";
});

// Listen for stop typing events
clintIo.on("stop_typing", ({ from }) => {
  const typingEl = document.getElementById("typingIndicator");
  if (typingEl) typingEl.style.display = "none";
});


// // // // Show groups list
function showGroupList(groups = []) {
  let cartonna = ``;
  for (let i = 0; i < groups.length; i++) {
    let imagePath = avatar;
    if (groups[i].group_image) {
      imagePath = `${baseURL}/upload/${groups[i].group_image}`;
    }
    cartonna += `
        <div onclick="displayGroupChat('${groups[i]._id
      }')" class="chatUser my-2">
        <img class="chatImage" src="${imagePath}" alt="" srcset="">
        <span class="ps-2">${groups[i].group}</span>
           <span id="${"g_" + groups[i]._id}" class="ps-2 closeSpan">
           🟢
        </span>
    </div>

        `;
    clintIo.emit("join_room", { roomId: groups[i].roomId });
  }

  document.getElementById("chatGroups").innerHTML = cartonna;
}
getUserData();
