class Post {
  constructor(id_user, text, image, createdAt, isVisible) {
    this.id_user = id_user;
    this.text = text;
    this.image = image;
    this.createdAt = createdAt;
    this.isVisible = isVisible;
  }
}
module.exports = { Post };
