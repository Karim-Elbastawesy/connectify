import api from "./api";

export async function registerUser(dataForm) {
  const payload = {
    username: dataForm.name,
    email: dataForm.email,
    password: dataForm.password,
    rePassword: dataForm.rePassword,
    dateOfBirth: dataForm.dateOfBirth,
    gender: dataForm.gender,
  };
  const { data } = await api.post("/users/signup", payload);
  return data;
}