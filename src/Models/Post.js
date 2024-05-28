class Post {
  constructor(id_user,title,image, text, comment,like, dislike,createdAt, isVisible) {
    this.id_user = id_user;
    this.title = title;
    this.image = image;
    this.text = text;
    this.comment = comment;
    this.like = like;
    this.dislike = dislike;
    this.createdAt = createdAt;
    this.isVisible = isVisible;
  }
}
module.exports = { Post };
