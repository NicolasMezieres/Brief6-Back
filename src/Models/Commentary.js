class Comment {
  constructor(id_user, id_post, text, image, id_comment, createdAt, isVisible) {
    this.id_user = id_user;
    this.id_post = id_post;
    this.text = text;
    this.image = image;
    this.createdAt = createdAt;
    this.isVisible = isVisible;
  }
}
module.exports = { Comment };
