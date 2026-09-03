export const getUserInitials = (firstName: string, lastName: string) => {
  return `${firstName ? firstName[0] : ""}${lastName ? lastName[0] : ""}`;
};

export const getAuthUserInitials = (name: string) => {
  const [firstName, lastName] = name?.split(" ");
  return getUserInitials(firstName, lastName);
};
