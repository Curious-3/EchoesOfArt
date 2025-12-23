export default function commentSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    /* ================= JOIN POST ROOM ================= */
    socket.on("join_post", (postId) => {
      socket.join(postId);
      console.log(`Socket ${socket.id} joined post ${postId}`);
    });

    /* ================= NEW COMMENT ================= */
    socket.on("new_comment", ({ postId, comment }) => {
      io.to(postId).emit("comment_added", comment);
    });

    /* ================= EDIT COMMENT ================= */
    socket.on("edit_comment", ({ postId, comment }) => {
      io.to(postId).emit("comment_updated", comment);
    });

    /* ================= DELETE COMMENT ================= */
    socket.on("delete_comment", ({ postId, commentId }) => {
      io.to(postId).emit("comment_deleted", commentId);
    });

    /* ================= ADD REPLY ================= */
    socket.on("reply_comment", ({ postId, commentId, reply }) => {
      io.to(postId).emit("reply_added", {
        commentId,
        reply,
      });
    });

    /* ================= EDIT REPLY ================= */
    socket.on("edit_reply", ({ postId, commentId, reply }) => {
      io.to(postId).emit("reply_updated", {
        commentId,
        reply,
      });
    });

    /* ================= DELETE REPLY ================= */
    socket.on("delete_reply", ({ postId, commentId, replyId }) => {
      io.to(postId).emit("reply_deleted", {
        commentId,
        replyId,
      });
    });

    /* ================= REACTION ================= */
    socket.on("react_comment", ({ postId, commentId, reactions }) => {
      io.to(postId).emit("reaction_updated", {
        commentId,
        reactions,
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
