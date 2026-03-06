import axios from "axios";

export async function registerUser(dataForm) {
  const { data } = await axios.post("/api/users/signup", dataForm);
  return data;
}