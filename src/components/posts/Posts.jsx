import { useEffect, useRef, useState, useCallback } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Avatar,
  Button,
  Divider,
  Chip,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Comments from "../shared/Comments";
import CreatePost from "../shared/CreatePost";
import { useUser } from "../context/userContext";

function timeAgo(str) {
  const diff = Math.floor((Date.now() - new Date(str)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(str).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ImageLightbox({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white"
        onClick={onClose}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <img
        src={src}
        alt="Preview"
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function PostCard({ post, onDelete, onEdit }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(
    post.likesCount ?? post.likes?.length ?? 0,
  );
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const menuRef = useRef(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();
  const [editBody, setEditBody] = useState(post.body || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [likePending, setLikePending] = useState(false);

  const comments = post.comments || [];
  const isOwner =
    user && (user._id || user.id) === (post.user?._id || post.user?.id);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function toggleLike() {
    if (likePending) return;
    setLikePending(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    api
      .put(`/posts/${post._id}/like`)
      .catch(() => {
        setLiked(wasLiked);
        setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
      })
      .finally(() => setLikePending(false));
  }

  function handleSaveEdit(onClose) {
    setSaving(true);
    api
      .put(`/posts/${post._id}`, { body: editBody })
      .then(() => {
        onEdit(post._id, editBody);
        onClose();
      })
      .catch((err) => console.error(err))
      .finally(() => setSaving(false));
  }

  function handleDelete(onClose) {
    setDeleting(true);
    api
      .delete(`/posts/${post._id}`)
      .then(() => {
        onDelete(post._id);
        onClose();
      })
      .catch((err) => console.error(err))
      .finally(() => setDeleting(false));
  }

  function goToProfile() {
    const id = post.user?._id || post.user?.id;
    if (!id) return;
    if (isOwner) navigate("/profile");
    else navigate(`/users/${id}`);
  }

  const photoSrc = post.user?.photo?.includes("undefined")
    ? undefined
    : post.user?.photo;

  return (
    <>
      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      <Card className="w-full shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <CardBody className="p-0 overflow-visible">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={goToProfile}
            >
              <Avatar
                src={photoSrc}
                name={post.user?.name?.[0]?.toUpperCase() || "U"}
                size="md"
                isBordered
                color="success"
                className="flex-shrink-0 group-hover:ring-2 group-hover:ring-green-400 transition-all"
              />
              <div>
                <p className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-green-600 transition-colors">
                  {post.user?.name || "Anonymous"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {timeAgo(post.createdAt)}
                </p>
              </div>
            </div>

            <div className="relative" ref={menuRef}>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                radius="full"
                className="text-gray-400"
                onPress={() => setMenuOpen((p) => !p)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </Button>

              {menuOpen && (
                <div className="absolute right-0 top-9 z-50 bg-white border border-gray-100 rounded-xl shadow-xl py-1 min-w-[160px]">
                  {isOwner ? (
                    <>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                        onClick={() => {
                          setMenuOpen(false);
                          onEditOpen();
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit post
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5"
                        onClick={() => {
                          setMenuOpen(false);
                          onDeleteOpen();
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Delete post
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                        onClick={() => {
                          setMenuOpen(false);
                          goToProfile();
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        View profile
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                        onClick={() => {
                          setMenuOpen(false);
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        Share post
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                        onClick={() => {
                          setMenuOpen(false);
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        Save post
                      </button>
                      <Divider className="my-1" />
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 flex items-center gap-2.5"
                        onClick={() => {
                          setMenuOpen(false);
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                        Report post
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {post.body && (
            <p className="px-5 pb-4 text-gray-700 text-sm leading-relaxed">
              {post.body}
            </p>
          )}

          {post.image && (
            <div
              className="overflow-hidden cursor-zoom-in"
              onClick={() => setLightboxSrc(post.image)}
            >
              <img
                src={post.image}
                alt="Post"
                className="w-full max-h-[420px] object-cover hover:scale-[1.01] transition-transform duration-500"
                onError={(e) => {
                  e.target.closest(".overflow-hidden").style.display = "none";
                }}
              />
            </div>
          )}
        </CardBody>

        <CardFooter className="flex flex-col gap-0 px-5 pt-2 pb-4">
          {(likeCount > 0 || comments.length > 0) && (
            <div className="flex items-center justify-between w-full mb-2 py-1">
              {likeCount > 0 ? (
                <div className="flex items-center gap-1">
                  <span className="text-base">
                    <i className="fa-solid fa-heart text-red-600"></i>
                  </span>
                  <span className="text-xs text-gray-500">{likeCount}</span>
                </div>
              ) : (
                <div />
              )}
              {comments.length > 0 && (
                <button
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowComments((p) => !p)}
                >
                  {comments.length} comment{comments.length !== 1 ? "s" : ""}
                </button>
              )}
            </div>
          )}

          <Divider className="mb-2" />

          <div className="flex items-center w-full gap-1 pb-2">
            <Button
              variant="light"
              size="sm"
              radius="md"
              className={`flex-1 font-semibold gap-1.5 transition-colors ${liked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
              startContent={
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              }
              onPress={toggleLike}
            >
              {liked ? "Liked" : "Like"}
            </Button>

            <Divider orientation="vertical" className="h-5" />

            <Button
              variant="light"
              size="sm"
              radius="md"
              className="flex-1 font-semibold text-gray-500 hover:text-blue-500 gap-1.5 transition-colors"
              startContent={
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
              onPress={() => setShowComments((p) => !p)}
            >
              {comments.length > 0 ? `${comments.length} Comments` : "Comment"}
            </Button>
          </div>

          {showComments && <Comments post={post} />}
        </CardFooter>
      </Card>

      <Modal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-gray-800 text-base">
                Edit Post
              </ModalHeader>
              <ModalBody>
                <Textarea
                  value={editBody}
                  onValueChange={setEditBody}
                  minRows={3}
                  maxRows={8}
                  variant="flat"
                  classNames={{
                    inputWrapper: "bg-gray-50",
                    input: "text-sm text-gray-700",
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" size="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  size="sm"
                  radius="full"
                  isLoading={saving}
                  isDisabled={!editBody.trim()}
                  onPress={() => handleSaveEdit(onClose)}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-gray-800 text-base">
                Delete Post
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this post? This cannot be
                  undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" size="sm" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  size="sm"
                  radius="full"
                  isLoading={deleting}
                  onPress={() => handleDelete(onClose)}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function PostSkeleton() {
  return (
    <Card className="w-full shadow-sm border border-gray-100">
      <CardBody className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="rounded-full w-10 h-10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-1/3 rounded-lg" />
            <Skeleton className="h-2 w-1/5 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-3 w-full rounded-lg" />
        <Skeleton className="h-3 w-4/5 rounded-lg" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </CardBody>
    </Card>
  );
}

function SuggestionsSidebar() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [connected, setConnected] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/suggestions?limit=6")
      .then((res) => {
        const list =
          res.data.data?.users ??
          res.data.data?.suggestions ??
          res.data.data ??
          [];
        setSuggestions(Array.isArray(list) ? list.slice(0, 6) : []);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, []);

  function toggleConnect(id) {
    setConnected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <Card className="border border-gray-100 shadow-sm sticky top-20">
      <CardBody className="p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          People you may know
        </p>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="rounded-full w-9 h-9 flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-2.5 w-2/3 rounded" />
                  <Skeleton className="h-2 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && suggestions.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            No suggestions right now
          </p>
        )}

        {!loading && suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((person) => {
              const id = person._id || person.id;
              const photo = person.photo?.includes("undefined")
                ? undefined
                : person.photo;
              const isConnected = connected[id];
              return (
                <div key={id} className="flex items-center gap-2.5">
                  <div
                    className="cursor-pointer flex-shrink-0"
                    onClick={() =>
                      navigate(`/users/${id}`, { state: { profile: person } })
                    }
                  >
                    <Avatar
                      src={photo}
                      name={person.name?.[0]?.toUpperCase() || "U"}
                      size="sm"
                      isBordered
                      color="success"
                      className="hover:ring-2 hover:ring-green-400 transition-all"
                    />
                  </div>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() =>
                      navigate(`/users/${id}`, { state: { profile: person } })
                    }
                  >
                    <p className="text-xs font-semibold text-gray-800 truncate hover:text-green-600 transition-colors">
                      {person.name || "User"}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      @
                      {person.username || person.email?.split("@")[0] || "user"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isConnected ? "flat" : "bordered"}
                    color={isConnected ? "default" : "success"}
                    radius="full"
                    className="text-[11px] font-semibold min-w-[70px] h-7 flex-shrink-0"
                    onPress={() => toggleConnect(id)}
                  >
                    {isConnected ? "✓ Pending" : "Connect"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default function Posts() {
  const [postList, setPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function getAllPosts() {
    setLoading(true);
    setError(null);
    api
      .get("/posts?limit=20")
      .then((response) => setPost(response.data.data.posts || []))
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setError("Unable to load posts. Please try again.");
      })
      .finally(() => setLoading(false));
  }

  function handleDeletePost(postId) {
    setPost((prev) => prev.filter((p) => p._id !== postId));
  }

  function handleEditPost(postId, newBody) {
    setPost((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, body: newBody } : p)),
    );
  }

  useEffect(() => {
    getAllPosts();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            <CreatePost onPostCreated={getAllPosts} />

            {loading &&
              Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}

            {error && !loading && (
              <Card className="border border-red-100 bg-red-50">
                <CardBody className="flex flex-col items-center py-10 gap-4">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-red-500 font-medium text-sm">{error}</p>
                  <Button
                    color="success"
                    variant="flat"
                    size="sm"
                    onPress={getAllPosts}
                  >
                    Try again
                  </Button>
                </CardBody>
              </Card>
            )}

            {!loading &&
              !error &&
              postList.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handleDeletePost}
                  onEdit={handleEditPost}
                />
              ))}

            {!loading && !error && postList.length === 0 && (
              <Card className="border border-gray-100">
                <CardBody className="flex flex-col items-center py-16 gap-3 text-gray-400">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-sm font-medium">
                    No posts yet. Be the first!
                  </p>
                </CardBody>
              </Card>
            )}
          </div>

          <div className="hidden lg:block w-64 flex-shrink-0">
            <SuggestionsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
