package test1;

class Blog {
    private String title;
    private Post[] posts;

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public void setPosts(Post[] posts) {
        this.posts = posts;
    }

    public Post[] getPosts() {
        return posts;
    }
}
