import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Chip,
  Skeleton,
  Divider,
} from "@heroui/react";
import api from "../../components/services/api";

const TYPE_CONFIG = {
  like: { icon: "❤️", color: "text-red-500", label: "liked your post" },
  comment: {
    icon: "💬",
    color: "text-blue-500",
    label: "commented on your post",
  },
  follow: {
    icon: "👤",
    color: "text-green-500",
    label: "started following you",
  },
  share: { icon: "🔁", color: "text-purple-500", label: "shared your post" },
  reply: {
    icon: "↩️",
    color: "text-orange-500",
    label: "replied to your comment",
  },
  default: {
    icon: "🔔",
    color: "text-gray-500",
    label: "sent you a notification",
  },
};

function timeAgo(str) {
  const diff = Math.floor((Date.now() - new Date(str)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications({ onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    api
      .get("/notifications?limit=30")
      .then((res) => {
        const list = res.data.data?.notifications ?? res.data.data ?? [];
        setNotifications(list);
        const unread = list.filter((n) => !n.read && !n.isRead).length;
        setUnreadCount(unread);
        if (onUnreadChange) onUnreadChange(unread);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [onUnreadChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  function markOne(id) {
    api.patch(`/notifications/${id}/read`).then(() => {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true, isRead: true } : n,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (onUnreadChange) onUnreadChange(Math.max(0, unreadCount - 1));
    });
  }

  function markAll() {
    setMarkingAll(true);
    api
      .patch("/notifications/read-all")
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true, isRead: true })),
        );
        setUnreadCount(0);
        if (onUnreadChange) onUnreadChange(0);
      })
      .finally(() => setMarkingAll(false));
  }

  const unread = notifications.filter((n) => !n.read && !n.isRead);

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
            {unread.length > 0 && (
              <Chip
                size="sm"
                color="danger"
                variant="flat"
                className="text-xs font-semibold"
              >
                {unread.length} new
              </Chip>
            )}
          </div>
          {unread.length > 0 && (
            <Button
              size="sm"
              variant="flat"
              color="success"
              radius="full"
              isLoading={markingAll}
              onPress={markAll}
              className="font-semibold text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {loading && (
          <Card className="border border-gray-100">
            <CardBody className="p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="rounded-full w-10 h-10 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-3/4 rounded-lg" />
                    <Skeleton className="h-2 w-1/3 rounded-lg" />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {!loading && notifications.length === 0 && (
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
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p className="text-sm font-medium">No notifications yet</p>
            </CardBody>
          </Card>
        )}

        {!loading && notifications.length > 0 && (
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <CardBody className="p-0">
              {notifications.map((n, i) => {
                const isUnread = !n.read && !n.isRead;
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.default;
                const actor = n.actor ?? n.sender ?? n.from ?? {};
                const photo = actor.photo?.includes("undefined")
                  ? undefined
                  : actor.photo;

                return (
                  <div key={n._id}>
                    <div
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        isUnread
                          ? "bg-green-50/60 hover:bg-green-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => isUnread && markOne(n._id)}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={photo}
                          name={actor.name?.[0] || "?"}
                          size="sm"
                          color="success"
                          isBordered={isUnread}
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none">
                          {cfg.icon}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-snug">
                          <span className="font-semibold">
                            {actor.name || "Someone"}
                          </span>{" "}
                          <span className={cfg.color}>{cfg.label}</span>
                        </p>
                        {n.post?.body && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            "{n.post.body}"
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>

                      {isUnread && (
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    {i < notifications.length - 1 && <Divider />}
                  </div>
                );
              })}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
