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

  if (isPending) return <div>로딩중입니다...</div>;

  if (isError) return <div>오류가 발생하였습니다...</div>;

  return (
    <>
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
          </div>
        );
      })}
    </>
  );
}

export default App;
