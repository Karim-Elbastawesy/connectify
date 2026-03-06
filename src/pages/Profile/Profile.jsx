import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Skeleton,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import api from "../../components/services/api";
import { useUser } from "../../components/context/userContext";

function PostItem({ post, onDelete, onEdit }) {
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

  function handleSaveEdit(onClose) {
    if (!editBody.trim()) return;
    setSaving(true);
    api
      .put(`/posts/${post._id}`, { body: editBody })
      .then(() => {
        onEdit(post._id, editBody);
        onClose();
      })
      .catch((err) => console.error("Edit failed:", err))
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
      .catch((err) => console.error("Delete failed:", err))
      .finally(() => setDeleting(false));
  }

  return (
    <>
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        {post.image && (
          <img
            src={post.image}
            alt="Post"
            className="w-full max-h-64 object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {post.body && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {post.body}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                radius="full"
                className="text-gray-400 hover:text-blue-500 min-w-7 w-7 h-7"
                onPress={onEditOpen}
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
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                radius="full"
                className="text-gray-400 hover:text-red-500 min-w-7 w-7 h-7"
                onPress={onDeleteOpen}
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
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

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

export default function Profile() {
  const { user, fetchUser } = useUser();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setPostsLoading(true);
    api
      .get("/posts/feed?only=me&limit=50")
      .then((res) => {
        const d = res.data.data;
        setPosts(d?.posts ?? d?.feed ?? []);
      })
      .catch(() => {
        api
          .get("/posts?limit=50")
          .then((res) => {
            const allPosts = res.data.data?.posts || [];
            const userId = user._id || user.id;
            setPosts(
              allPosts.filter((p) => (p.user?._id || p.user?.id) === userId),
            );
          })
          .catch(() => setPosts([]));
      })
      .finally(() => setPostsLoading(false));
  }, [user]);

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    setUploading(true);
    api
      .put("/users/upload-photo", formData)
      .then(() => fetchUser())
      .catch((err) => console.error("Photo upload failed:", err))
      .finally(() => setUploading(false));
  }

  function handleDeletePost(postId) {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }

  function handleEditPost(postId, newBody) {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, body: newBody } : p)),
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="border border-gray-100">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="rounded-full w-20 h-20" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                  <Skeleton className="h-3 w-2/5 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-3 w-full rounded-lg" />
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  const photoSrc = user.photo
    ? `${user.photo}?v=${user.updatedAt || Date.now()}`
    : undefined;

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="border border-gray-100 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Avatar
                    key={photoSrc}
                    src={photoSrc}
                    name={user.name?.[0]?.toUpperCase() || "U"}
                    className="w-20 h-20 text-2xl"
                    isBordered
                    color="success"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading ? (
                      <svg
                        className="animate-spin text-white"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {user.name || user.username || "User"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    @{user.username || user.email?.split("@")[0] || "user"}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                </div>
              </div>

              <Button
                size="sm"
                variant="bordered"
                radius="full"
                className="border-green-500 text-green-600 font-semibold hover:bg-green-50"
              >
                Edit Profile
              </Button>
            </div>

            {user.bio && (
              <>
                <Divider className="my-4" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  {user.bio}
                </p>
              </>
            )}

            <Divider className="my-4" />

            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">
                  {posts.length}
                </p>
                <p className="text-xs text-gray-400">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">
                  {user.followersCount ?? "—"}
                </p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">
                  {user.followingCount ?? "—"}
                </p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardBody className="p-4">
            <p className="text-sm font-semibold text-gray-700 mb-4">Posts</p>

            {postsLoading && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-full rounded-lg" />
                    <Skeleton className="h-3 w-3/4 rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {!postsLoading && posts.length === 0 && (
              <div className="flex flex-col items-center py-10 gap-3 text-gray-400">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-sm font-medium">No posts yet</p>
              </div>
            )}

            {!postsLoading && posts.length > 0 && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostItem
                    key={post._id}
                    post={post}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                  />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
