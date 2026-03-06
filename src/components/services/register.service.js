import api from "./api";

export async function registerUser(dataForm) {
  console.log("Sending to API:", dataForm);
  const { data } = await api.post("/users/signup", dataForm);
  return data;
}