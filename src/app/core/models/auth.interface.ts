export interface registerData {
  name: string;
  email: string;
  password: string;
  phone: string;
  rePassword: string;
}

export interface loginData {
  email: string;
  password: string;
}

export interface userData {
  message: string;
  user: User;
  token: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
}

export interface TokenT {
  id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}
export interface PasswordResponse {
  statusMsg: string;
  message: string;
}
