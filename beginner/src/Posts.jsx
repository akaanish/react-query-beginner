import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostDetail } from "./PostDetail";
import { useEffect } from "react";
const maxPostPage = 10;

async function fetchPosts(currentPage) {
    const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${currentPage}`
    );
    return response.json();
}

export function Posts() {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPost, setSelectedPost] = useState(null);

    // prefetching
    const queryClient = useQueryClient();
    useEffect(() => {
        if (currentPage < maxPostPage) {
            const nextPage = currentPage + 1;
            queryClient.prefetchQuery(["posts", nextPage], () => fetchPosts(nextPage))
        }
    }, [currentPage, queryClient]);

    // using react query to fetch data
    const { data, isLoading, isError, error, isPreviousData } = useQuery(["posts", currentPage], () => fetchPosts(currentPage), {
        staleTime: 5000,
        keepPreviousData: true
    });
    if (isLoading) return <h3>Loading...</h3>;
    // By default - react query retries api 3 times. It is also configurable
    if (isError) return <><h3>Oops, Something went wrong</h3><p>{error.toString()}</p></>;

    return (
        <>
            <ul>
                {data.map((post) => (
                    <li
                        key={post.id}
                        className="post-title"
                        onClick={() => setSelectedPost(post)}
                    >
                        {post.title}
                    </li>
                ))}
            </ul>
            <div className="pages">
                <button disabled={currentPage <= 1} onClick={() => { setCurrentPage(prev => prev - 1) }}>
                    Previous page
                </button>
                <span>Page {currentPage}</span>
                <button disabled={currentPage >= maxPostPage} onClick={() => { if(!isPreviousData) setCurrentPage(prev => prev + 1) }}>
                    Next page
                </button>
            </div>
            <hr />
            {selectedPost && <PostDetail post={selectedPost} />}
        </>
    );
}