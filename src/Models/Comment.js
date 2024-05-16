class Comment {
  constructor(id_user, id_post, text, id_comment, isVisible) {
    this.id_user = id_user;
    this.id_post = id_post;
    this.text = text;
    this.id_comment = id_comment;
    this.isVisible = isVisible;
  }
}
module.exports = { Comment };
