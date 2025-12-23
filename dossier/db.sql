-- Active: 1742731468056@@127.0.0.1@3306@mini_social_media
CREATE DATABASE mini_social_media;

USE mini_social_media;

SHOW tables;
# ---------- users ---------- #

CREATE TABLE users (
    user_id INT primary key AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    gender ENUM('male','female') ,
    user_image VARCHAR(255),
    bio TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    follow_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwodrd VARCHAR(100) UNIQUE NOT NULL,
    password_decrp VARCHAR(120) UNIQUE NOT NULL,
    is_verified BOOLEAN  DEFAULT FALSE,
    verification_token VARCHAR(100) UNIQUE,
    refresh_token TEXT UNIQUE,
    public_user_img_id VARCHAR(50) UNIQUE
);

ALTER TABLE users MODIFY user_image VARCHAR(255);

SELECT *
FROM posts
    JOIN users ON posts.user_id = users.id
WHERE
    id = 34;

SELECT username, user_image, posts.*
FROM posts
    JOIN users ON posts.post_id = users.id
LIMIT 2
OFFSET
    0;

SELECT username, title FROM users INNER JOIN posts ON id = user_id;

SELECT * FROM users ORDER BY userid limit 3 OFFSET 3;

SELECT * FROM users WHERE username LIKE "a%9";
# ---------- posts ---------- #
CREATE TABLE posts(
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_image VARCHAR(255) ,
    title VARCHAR(120),
    body TEXT,
    like_count INT DEFAULT 0,
    public_post_img_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(post_id) ON DELETE CASCADE,
);

ALTER TABLE posts ADD COLUMN like_count INT DEFAULT 0 AFTER title;

ALTER TABLE posts DROP COLUMN like_count;
# ---------- password_rest ---------- #

CREATE TABLE password_rests (
    email VARCHAR(255) NOT NULL,
    code VARCHAR(8) NOT NULL,
    expires_at DATETIME NOT NULL
);
SHOW TABLES;
select * from password_resets;
# ---------- comments ---------- #
CREATE TABLE comments(
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT ,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIME,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
);

ALTER TABLE comments
ADD CONSTRAINT fk_comment_post_id FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE;

ALTER TABLE comments
ADD COLUMN parent_comment_id INT NOT NULL AFTER user_id;

ALTER TABLE comments DROP FOREIGN KEY fk_parent_comment_id;

ALTER TABLE comments
ADD CONSTRAINT fk_parent_comment_id FOREIGN KEY (parent_comment_id) REFERENCES comments (comment_id) ON DELETE CASCADE;

# ---------- likes ---------- #
CREATE TABLE likes(
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    like_type ENUM("like","love","laugh","sad") DEFAULT "like",
    UNIQUE(user_id,post_id),
    CONSTRAINT fk_like_post_id FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_like_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
SELECT * FROM posts;
INSERT INTO posts (user_id) VALUES (99);
DESC posts;
ALTER TABLE likes
MODIFY like_type ENUM(
    "like",
    "love",
    "laugh",
    "sad"
);

# ---------- follows ---------- #
CREATE TABLE followers(
    follow_id INT PRIMARY KEY AUTO_INCREMENT,
    following_id  INT NOT NULL,
    follower_id INT NOT NULL,
    CHECK (following_id  <> follower_id),
    status ENUM("pending","accepted") DEFAULT 'accepted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT un_follower_following UNIQUE (following_id,follower_id),
    CONSTRAINT fk_following_id FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_follwer_id FOREIGN KEY (follower_id) REFERENCES  users(id) ON DELETE CASCADE
);

# ---------- notifications ---------- #
CREATE TABLE notifications(
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipient_id INT NOT NULL,
    sender_id INT,
    post_id INT, 
    type ENUM("like","comment","follow","message") NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id)  
);

# ---------- saved posts ---------- #
CREATE TABLE saved_posts(
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_saved_posts UNIQUE (user_id,post_id),
    CONSTRAINT fk_saved_post_id FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_saved_post_user_id FOREIGN KEY (post_id) REFERENCES posts(post_id)
);

INSERT INTO
    saved_posts (user_id, post_id)
VALUES (1, 2)
DROP Table saved_posts;
# ---------- select  all tables ---------- #
-- get post with his author with all comments with his authors
SELECT u1., posts.*, comment_id, comments.user_id, content,u1.id AS post_user_id, u1.username,u2.id AS comment_user_id,u2.username
FROM comments
    JOIN posts ON comments.post_id = posts.post_id
    JOIN users u1 ON posts.user_id = u1.id
    JOIN users u2 ON comments.user_id = u2.id
WHERE
    posts.post_id = 4;
-- get all comments with his author of a spicific post
SELECT *
FROM comments
    JOIN posts ON comments.post_id = posts.post_id
    JOIN users ON comments.user_id = users.id
WHERE
    posts.post_id = 4;

SELECT * FROM likes WHERE post_id = 10;

SELECT post_id, COUNT(*) AS total_post_likes
FROM likes
GROUP BY
    post_id
    --  HAVING post_id;

SELECT COUNT(*) FROM comments WHERE post_id = 4;

SELECT
    id,
    username,
    user_image,
    posts.*,
    (
        SELECT COUNT(*)
        FROM comments
        WHERE
            comments.post_id = posts.post_id
    ) AS totalComments,
    (
        SELECT COUNT(*)
        FROM likes
        WHERE
            likes.post_id = posts.post_id
            AND user_id = 34
    ) AS is_liked
FROM posts
    JOIN users ON posts.user_id = users.id
LIMIT 5
OFFSET
    0;

SELECT p1.*, u.username
FROM posts p1
    JOIN users u ON p1.user_id = u.id;

SELECT comments.*, posts.body, users.username
FROM comments
    JOIN posts ON comments.post_id = posts.post_id
    JOIN users ON comments.user_id = users.id;

select comments.content as comment, users.username as name
from comments
    join users on users.id = comments.user_id
WHERE
    post_id = 4;

SELECT * FROM likes;

select COUNT(likes.user_id), COUNT(comments.user_id)
from likes
    JOIN comments on likes.user_id = comments.user_id
where
    user_id = (
        SELECT user_id
        FROM posts
        WHERE
            post_id = 4
    );

SELECT * FROM users;

SELECT * FROM likes;

SELECT * FROM comments;

SELECT * FROM posts;

SELECT * FROM saved_posts;

INSERT INTO saved_posts (user_id, post_id) VALUES (31, 2);

SELECT
    username,
    user_image,
    posts.*,
    (
        SELECT COUNT(*)
        FROM likes
        WHERE
            likes.post_id = saved_posts.post_id
    ) AS total_likes,
    (
        SELECT COUNT(*)
        FROM comments
        WHERE
            comments.post_id = saved_posts.post_id
    ) AS total_comments
FROM
    saved_posts
    JOIN posts ON saved_posts.post_id = posts.post_id
    JOIN users ON posts.user_id = users.id
WHERE
    saved_posts.user_id = 31;

SHOW DATABASES;

USE mini_social_media;

SELECT users.*
FROM posts
    RIGHT JOIN users ON posts.user_id = users.id
WHERE
    posts.post_id IS NULL;

SELECT *
FROM users
    LEFT JOIN posts ON users.id = posts.user_id
WHERE
    posts.post_id IS NULL;

SELECT * FROM posts WHERE user_id = 6;

SELECT * FROM posts JOIN users ON posts.user_id = users.id;

SELECT * FROM users;
SELECT * FROM followers;
SELECT * FROM posts;
SELECT users.username,
SELECT * FROM users;

SELECT
    u1.id AS FOLLOWING_ID,
    u1.username AS FOLLOWING_NAME,
    u2.id AS FOLLOWER_ID,
    u2.username AS FOLLOWER_NAME
FROM
    followers
    JOIN users u1 ON followers.following_id = u1.id
    JOIN users u2 ON followers.follower_id = u2.id
WHERE
    followers.following_id = 2;
    INSERT INTO likes;
SELECT * FROM followers;
SELECT * FROM users;

SELECT * FROM posts;

SELECT id, posts.* FROM users, posts WHERE;

SELECT * FROM likes;

SELECT *
from likes
WHERE
    user_id > ALL (1,2,3);
SELECT * FROM likes;