class Post {
  constructor(id_user, text, createdAt, isVisible) {
    this.id_user = id_user;
    this.text = text;
    this.createdAt = createdAt;
    this.isVisible = isVisible;
  }
}
module.exports = { Post };
