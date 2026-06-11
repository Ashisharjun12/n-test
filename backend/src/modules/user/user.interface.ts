import { IUser, TUserRole } from "./user.schema.js";

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  role?: TUserRole;
  avatarUrl?: string;
};

export type UpdateUserDto = {
  name?: string;
  avatarUrl?: string;
};

export type UpdateRoleDto = {
  role: TUserRole;
};

export interface IUserRepository {
  create(data: CreateUserDto): Promise<IUser>;
  findAll(): Promise<IUser[]>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  update(id: string, data: UpdateUserDto): Promise<IUser | null>;
  updateRole(id: string, data: UpdateRoleDto): Promise<IUser | null>;
  delete(id: string): Promise<void>;
}

export interface IUserService {
  create(data: CreateUserDto): Promise<IUser>;
  findAll(): Promise<IUser[]>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  update(id: string, data: UpdateUserDto): Promise<IUser | null>;
  updateRole(id: string, data: UpdateRoleDto): Promise<IUser | null>;
  delete(id: string): Promise<void>;
}
