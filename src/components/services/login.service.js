import axios from "axios";

export async function loginUser(dataForm) {
  const { data } = await axios.post("/api/users/signin", dataForm);
  return data;
}