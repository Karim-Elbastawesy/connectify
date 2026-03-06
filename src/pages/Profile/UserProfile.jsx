import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Divider,
  Skeleton,
} from "@heroui/react";
import api from "../../components/services/api";
import { useUser } from "../../components/context/userContext";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: me } = useUser();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;
    if (me && (me._id === userId || me.id === userId)) {
      navigate("/profile", { replace: true });
      return;
    }
    setLoading(true);
    api
      .get("/posts?limit=100")
      .then((res) => {
        const all = res.data.data?.posts || [];
        const userPosts = all.filter(
          (p) => p.user?._id === userId || p.user?.id === userId,
        );
        if (userPosts.length > 0) {
          setProfile(userPosts[0].user);
          setPosts(userPosts);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, me, navigate]);

  if (loading) {
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
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gray-50 min-h-screen py-10 px-4">
        <div className="max-w-2xl mx-auto">
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p className="text-sm font-medium">User not found</p>
              <Button
                size="sm"
                variant="flat"
                color="success"
                onPress={() => navigate(-1)}
              >
                Go back
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  const photoSrc = profile.photo?.includes("undefined")
    ? undefined
    : profile.photo;

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Button
          size="sm"
          variant="light"
          className="text-gray-500 -ml-2"
          startContent={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          }
          onPress={() => navigate(-1)}
        >
          Back
        </Button>

        <Card className="border border-gray-100 shadow-sm">
          <CardBody className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Avatar
                  src={photoSrc}
                  name={profile.name?.[0]?.toUpperCase() || "U"}
                  className="w-20 h-20 text-2xl"
                  isBordered
                  color="success"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {profile.name || "User"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    @
                    {profile.username || profile.email?.split("@")[0] || "user"}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                color={connected ? "default" : "success"}
                variant={connected ? "flat" : "solid"}
                radius="full"
                className="font-semibold"
                onPress={() => setConnected((p) => !p)}
              >
                {connected ? "✓ Connected" : "Connect"}
              </Button>
            </div>

            <Divider className="my-4" />

            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">
                  {posts.length}
                </p>
                <p className="text-xs text-gray-400">Posts</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardBody className="p-4">
            <p className="text-sm font-semibold text-gray-700 mb-4">Posts</p>
            {posts.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-3 text-gray-400">
                <p className="text-sm">No posts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="border border-gray-100 rounded-xl overflow-hidden"
                  >
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
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
