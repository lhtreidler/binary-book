export const formatEmail = (email: string) => email.toLowerCase().trim();

export const formatUsername = (username: string) =>
  username.toLowerCase().trim().replace(/[ ]/g, "_");

export const splitTags = (str: string) => str.split("/").map((n) => n.trim());
