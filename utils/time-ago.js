const timeAgo = (dateString) => {
  const currentDate = new Date();
  const then = new Date(dateString);
  const seconds = Math.floor((currentDate - then) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes qgo`;
  const hours = Math.floor(minutes / 60);
  if (hours < 60) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 24) return `${days} days ago`;
};
module.exports = { timeAgo };
