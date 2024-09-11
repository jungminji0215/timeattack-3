import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

function App() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [views, setViews] = useState("");

  /** post 조회 */
  const getPosts = async () => {
    const { data } = await axios.get("http://localhost:4000/posts");
    console.log("data :>> ", data);
    return data;
  };

  const {
    data: posts,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
  /** post 조회 */

  /** post 추가 */
  const addPost = async (post) => {
    await axios.post("http://localhost:4000/posts", post);
  };

  const { mutate } = useMutation({
    mutationFn: addPost,
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const handleAddPost = (e) => {
    e.preventDefault();

    const post = {
      title: title,
      views: views,
    };

    mutate(post);
  };
  /** post 추가 */

  /** 프로필 조회 */

  const getProfile = async () => {
    const { data } = await axios.get("http://localhost:4000/profile");
    console.log("data :>> ", data);
    return data;
  };

  const {
    data: profile,
    isPending: profilePending,
    isError: profileError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  /** 댓글보기 */

  const getComment = async () => {
    const { data } = await axios.get("http://localhost:4000/comments");
    return data;
  };

  const {
    data: comment,
    refetch,
    isPending: commentPending,
  } = useQuery({
    queryKey: ["comment"],
    queryFn: getComment,
    enabled: false,
  });

  console.log("comment :>> ", comment);

  const handleGetComment = () => {};
  /** 댓글보기 */

  if (profilePending) return <div>프로필 조회가 로딩중입니다...</div>;
  if (profileError) return <div>프로필 조회에 오류가 발생했습니다...</div>;

  if (isPending) return <div>로딩중입니다...</div>;

  if (isError) return <div>오류가 발생하였습니다...</div>;

  if (commentPending) <div>로딩중입니다...</div>;

  return (
    <>
      <div>{profile.name}</div>
      <form onSubmit={handleAddPost}>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <input
          value={views}
          onChange={(e) => {
            setViews(e.target.value);
          }}
        />
        <button type={"submit"}>추가</button>
      </form>

      {posts.map((post) => {
        return (
          <div key={post.id}>
            <h1>{post.title}</h1>
            <span>{post.views}</span>

            <button
              onClick={() => {
                refetch();
              }}
            >
              댓글보기
            </button>
            {/* {comment.map((c) => {
              return <div key={c.id}>c.text</div>;
            })} */}
          </div>
        );
      })}
    </>
  );
}

export default App;
