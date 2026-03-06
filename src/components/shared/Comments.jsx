import { useState } from "react";
import { Avatar, Input, Divider } from "@heroui/react";
import api from "../services/api";
import { useUser } from "../context/userContext";

export default function Comments({ post }) {
  const { user } = useUser();
  const [comments, setComments] = useState(post.comments || []);
  const [showAll, setShowAll] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const visibleComments = showAll ? comments : comments.slice(0, 2);

  function handleAddComment() {
    if (!newComment.trim()) return;
    setLoading(true);
    api
      .post(`/posts/${post._id}/comments`, { content: newComment })
      .then((res) => {
        const raw = res.data.data;
        const created = {
          _id: raw?._id || Date.now().toString(),
          content: raw?.content ?? newComment,
          commentCreator: raw?.commentCreator ?? {
            _id: user?._id,
            name: user?.name || user?.username || "You",
            photo: user?.photo,
          },
          createdAt: raw?.createdAt || new Date().toISOString(),
        };
        setComments((prev) => [created, ...prev]);
        setNewComment("");
      })
      .catch((err) => console.error("Comment failed:", err))
      .finally(() => setLoading(false));
  }

  return (
    <div className="w-full">
      {comments.length > 0 && (
        <div className="space-y-2 mb-3">
          {visibleComments.map((comment) => {
            const photo = comment.commentCreator?.photo?.includes("undefined")
              ? undefined
              : comment.commentCreator?.photo;
            return (
              <div key={comment._id} className="flex items-start gap-2">
                <Avatar
                  src={photo}
                  name={comment.commentCreator?.name?.[0]?.toUpperCase() || "U"}
                  size="sm"
                  color="success"
                  className="flex-shrink-0 mt-0.5"
                />
                <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                  <p className="text-xs font-semibold text-gray-700">
                    {comment.commentCreator?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
          {comments.length > 2 && (
            <button
              className="text-xs font-semibold text-green-600 hover:text-green-700 pl-1 transition-colors"
              onClick={() => setShowAll((p) => !p)}
            >
              {showAll ? "Show less" : `View all ${comments.length} comments`}
            </button>
          )}
        </div>
      )}

      <Divider className="mb-3" />

      <div className="flex items-center gap-2">
        <Avatar
          src={user?.photo?.includes("undefined") ? undefined : user?.photo}
          name={user?.name?.[0]?.toUpperCase() || "U"}
          size="sm"
          isBordered
          color="success"
          className="flex-shrink-0"
        />
        <Input
          placeholder="Write a comment..."
          value={newComment}
          onValueChange={setNewComment}
          size="sm"
          radius="full"
          variant="flat"
          classNames={{
            inputWrapper: "bg-gray-100 hover:bg-gray-200 shadow-none",
            input: "text-sm",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
          endContent={
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading}
              className="text-green-500 hover:text-green-600 disabled:opacity-30 transition-colors pr-1"
            >
              {loading ? (
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          }
        />
      </div>
    </div>
  );
}
