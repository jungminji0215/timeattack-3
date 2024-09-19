import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

function App() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [views, setViews] = useState("");

  const [selectedPostId, setSelectedPostId] = useState(null);

  const [commentsTexts, setCommentsTexts] = useState({});

  /** ---------------------------- post 조회 ---------------------------- */
  const {
    data: posts,
    isPending: isPostsPending,
    isError: isPostsError,
  } = useQuery({
    queryKey: ["posts"],
    /**
     *  await 왜 해야하나? : 우리가 사용하려는 데이터가 axios.get 이 아님()
     * axios get 을 하면 Object 가 담겨있다. 이 object 에서 원하는 값을 뽑아야한다.
     */
    /**
     * 그리고 queryFn 은 캐싱된 데이터가 없을때 api 를 호출한다.
     */
    queryFn: async () => {
      const response = await axios.get("http://localhost:4000/posts");
      const data = response.data;
      return data;
    },
  });

  /**
   * 여기서 처음 undefined 가 뜨는 이유
   * 캐싱된 데이터가 없어서!
   */
  // console.log("posts :>> ", posts);

  /** ---------------------------- post 추가 ---------------------------- */

  const { mutate } = useMutation({
    /**
     * 여기에는 왜 async/await 를 붙였는가
     * 완료 되어야, 동기화도 할 수 있음
     *  async/await 가 없으면 등록한 값이 새로고침해야 보이거나, 다시 등록하면 막 2개가 생김...
     * 즉, 등록했다는 것을 기다리고 완료가 되어야 정상적으로
     * queryClient.invalidateQueries(["posts"]); 이 코드가 실행됨
     * 일의 순서가 중요할 때 동기적 처리가 중요하다.
     * 즉, 비동기적인 처리를 await 를 써서 동기적으로 실행하도록 해준 것이다.
     */
    mutationFn: async (post) => {
      axios.post("http://localhost:4000/posts", post);
    },
    onSuccess: () => {
      /**
       * 성공 후 처리할 내용 : 원래 갖고있었던 posts 라는 이름으로 캐싱된 데이터를 동기화
       */
      queryClient.invalidateQueries(["posts"]);
    },
  });

  /** ---------------------------- 프로필 조회 ---------------------------- */

  /** data, isPending, isError 이 post 조회했던 것이랑 이름이 겹친다.
   * 이런 경우에는 방지하기 위해서 alias(별칭) 을 사용하자!
   */
  const {
    data: profile,
    isPending: isProfilePending,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await axios.get("http://localhost:4000/profile");
      return data;
    },
  });

  /** ---------------------------- 댓글보기 ---------------------------- */

  const {
    data: comments,
    /** 댓글은 최초 화면이 렌더링 됐을 때 가져오는 것이 아니기때문에
     * isPending  필요없다
     */
    // isPending: isCommentsPending,
    isError: isCommentsError,
  } = useQuery({
    queryKey: ["comments", selectedPostId],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://localhost:4000/comments?postId=${selectedPostId}`
      );
      return data;
    },
    enabled: !!selectedPostId,
  });

  /** ---------------------------- 댓글 작성 ---------------------------- */
  const addCommentMutation = useMutation({
    mutationFn: async (newComment) => {
      axios.post("http://localhost:4000/comments", {
        text: newComment.text,
        postId: newComment.postId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments"],
      });
    },
  });

  useEffect(() => {
    console.log("commentsTexts :>> ", selectedPostId);
  }, [commentsTexts]);

  /** ---------------------------- 끝 ---------------------------- */

  if (isPostsPending || isProfilePending) return <div>로딩중입니다.</div>;
  if (isPostsError || isProfileError || isCommentsError)
    return <div>오류가 발생하였습니다.</div>;

  return (
    <>
      <div>{profile.name}</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          mutate({
            title,
            views,
          });
        }}
      >
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
            <div>
              <h1>제목 : {post.title}</h1>
              <span>조회수 : {post.views}</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                addCommentMutation.mutate({
                  text: commentsTexts[post.id] || "",
                  postId: post.id,
                });

                setCommentsTexts((prev) => {
                  return {
                    prev,
                    [post.id]: "",
                  };
                });
              }}
            >
              <p>댓글 입력</p>
              <input
                type="text"
                /** 객체에 접근하는법
                 * commentsTexts.
                 * commentsTexts[]
                 *
                 *
                 */
                value={commentsTexts[post.id] || ""}
                onChange={(e) => {
                  setCommentsTexts((prev) => {
                    return {
                      prev,
                      [post.id]: e.target.value,
                    };
                  });
                }}
              />
              <button type="submit">댓글 추가</button>
            </form>

            <button
              onClick={() => {
                setSelectedPostId(post.id);
              }}
            >
              댓글보기
            </button>
            {selectedPostId === post.id ? (
              <>
                {comments?.map((comment) => {
                  console.log("dsfsdfdf");
                  return <p key={comment.id}>{comment.text}</p>;
                })}
              </>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export default App;
