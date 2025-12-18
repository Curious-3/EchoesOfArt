export default function commentSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join_post", (postId) => {
      socket.join(postId);
    });

    socket.on("new_comment", ({ postId, comment }) => {
      io.to(postId).emit("comment_added", comment);
    });
  });
}
