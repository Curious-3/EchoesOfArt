export default function commentSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_post", (postId) => {
      console.log("Joined room:", postId);
      socket.join(postId);
      console.log(`${socket.id} joined post ${postId}`);
    });

    socket.on("new_comment", ({ postId, comment }) => {
      io.to(postId).emit("comment_added", comment);
    });
  });
}
