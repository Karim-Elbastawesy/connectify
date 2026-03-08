import api from "./api";

export async function registerUser(dataForm) {
  const { data } = await api.post("/users/signup", dataForm);
  return data;
}