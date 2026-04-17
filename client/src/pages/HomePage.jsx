import Feed from "../components/Feed/Feed";
import CreatePost from "../components/Feed/CreatePost";
import { useUIStore } from "../store/uiStore";
import { useSocket } from "../hooks/useSocket";
import PostModal from "../components/Feed/PostModal";

export default function HomePage() {
  const { activeModal, closeModal } = useUIStore();

  // Connect Socket.IO
  useSocket();

  return (
    <>
      <Feed />
      {activeModal === "createPost" && <CreatePost onClose={closeModal} />}
      {activeModal === "postDetail" && <PostModal />}
    </>
  );
}