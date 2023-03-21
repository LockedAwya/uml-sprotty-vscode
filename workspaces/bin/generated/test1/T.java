package test1;

abstract class T {
    private String titlee;
    private Comment[] comments;

    public void setTitlee(String titlee) {
        this.titlee = titlee;
    }

    public String getTitlee() {
        return titlee;
    }

    public void setComments(Comment[] comments) {
        this.comments = comments;
    }

    public Comment[] getComments() {
        return comments;
    }
}
