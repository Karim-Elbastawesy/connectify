import api from "./api";

export async function loginUser(dataForm) {
  const { data } = await api.post("/users/signin", dataForm);
  return data;
}