CREATE DATABASE mini_social_media;

SHOW TABLES;

USE social_med;

DROP TABLE
CREATE TABLE users1 (
    user_id INT primary key AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    gender ENUM('male', 'female'),
    user_image VARCHAR(255),
    bio TEXT,
    follow_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwodrd VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE posts1 (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_image VARCHAR(255),
    title VARCHAR(120),
    body TEXT,
    like_count INT DEFAULT 0,
    public_post_img_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE comments1 (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE likes1 (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    like_type ENUM(
        "like",
        "love",
        "laugh",
        "sad"
    ) DEFAULT "like",
    UNIQUE (user_id, post_id),
    CONSTRAINT fk_like_post_id FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
    CONSTRAINT fk_like_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);
# ---------- follows ---------- #
CREATE TABLE followers1(
    follow_id INT PRIMARY KEY AUTO_INCREMENT,
    following_id  INT NOT NULL,
    follower_id INT NOT NULL,
    CHECK (following_id  <> follower_id),
    status ENUM("pending","accepted") DEFAULT 'accepted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT un_follower_following UNIQUE (following_id,follower_id),
    CONSTRAINT fk_following_id FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_follwer_id FOREIGN KEY (follower_id) REFERENCES  users(user_id) ON DELETE CASCADE
);
# ---------- saved posts ---------- #
CREATE TABLE saved_posts1(
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_saved_posts UNIQUE (user_id,post_id),
    CONSTRAINT fk_saved_post_id FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_saved_post_user_id FOREIGN KEY (post_id) REFERENCES posts(post_id)
);

show tables;

DESC posts;

SELECT * FROM users;

SELECT * FROM posts;
-- Insertion d'utilisateurs
INSERT INTO
    users1 (
        username,
        gender,
        user_image,
        bio,
        email,
        password
    )
VALUES (
        'ali',
        'male',
        'ali.jpg',
        'Développeur passionné',
        'ali@email.com',
        'pass123'
    ),
    (
        'sara',
        'female',
        'sara.jpg',
        'Photographe',
        'sara@email.com',
        'pass456'
    ),
    (
        'youssef',
        'male',
        NULL,
        'Étudiant',
        'youssef@email.com',
        'pass789'
    );

-- Insertion de posts
INSERT INTO
    posts1 (
        user_id,
        post_image,
        title,
        body,
        public_post_img_id
    )
VALUES (
        1,
        'post1.jpg',
        'Premier post',
        'Ceci est le premier post.',
        'img1'
    ),
    (
        2,
        'post2.jpg',
        'Voyage',
        'Photo de mon dernier voyage.',
        'img2'
    );

-- Insertion de commentaires
INSERT INTO
    comments1 (content, post_id, user_id)
VALUES ('Super post !', 1, 2),
    (
        'Merci pour le partage.',
        2,
        1
    );

-- Insertion de likes
INSERT INTO
    likes1 (post_id, user_id, like_type)
VALUES (1, 2, 'like'),
    (2, 1, 'love');

-- Insertion de relations followers
INSERT INTO
    followers1 (
        following_id,
        follower_id,
        status
    )
VALUES (1, 2, 'accepted'),
    (2, 1, 'accepted');