import { useState } from "react";
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Textarea,
  Divider,
} from "@heroui/react";
import api from "../services/api";
import { useUser } from "../context/userContext";

export default function CreatePost({ onPostCreated }) {
  const { user } = useUser();
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    setImagePreview(null);
  }

  function handleSubmit() {
    if (!body.trim() && !image) return;
    const formData = new FormData();
    formData.append("body", body);
    if (image) formData.append("image", image);
    setLoading(true);
    api
      .post("/posts", formData)
      .then(() => {
        setBody("");
        setImage(null);
        setImagePreview(null);
        if (onPostCreated) onPostCreated();
      })
      .catch((err) => console.error("Post creation failed:", err))
      .finally(() => setLoading(false));
  }

  return (
    <Card className="w-full shadow-sm border border-gray-100 mb-4">
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <Avatar
            src={user?.photo || undefined}
            name={user?.name?.[0] || "U"}
            size="md"
            isBordered
            color="success"
            className="flex-shrink-0 mt-1"
          />
          <Textarea
            placeholder="What's on your mind?"
            value={body}
            onValueChange={setBody}
            minRows={2}
            maxRows={6}
            variant="flat"
            classNames={{
              input: "text-sm text-gray-700 resize-none",
              inputWrapper:
                "bg-gray-50 hover:bg-gray-100 focus-within:!bg-gray-50 shadow-none border-none",
            }}
          />
        </div>

        {imagePreview && (
          <div className="relative mt-3 ml-11 rounded-xl overflow-hidden max-h-60">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full object-cover max-h-60"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        <Divider className="my-3" />

        <div className="flex items-center justify-between ml-11">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-green-50">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

          <Button
            color="success"
            size="sm"
            radius="full"
            className="font-semibold px-6"
            isLoading={loading}
            isDisabled={!body.trim() && !image}
            onPress={handleSubmit}
          >
            Post
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
