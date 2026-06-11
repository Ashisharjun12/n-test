import { User, IUser } from "./user.schema.js";
import { CreateUserDto, IUserRepository, UpdateRoleDto, UpdateUserDto } from "./user.interface.js";

export class UserRepository implements IUserRepository {

  async create(data: CreateUserDto): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  async findAll(): Promise<IUser[]> {
    return User.find().lean<IUser[]>();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).lean<IUser>();
  }

  // includes password field (for login comparison)
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select("+password").lean<IUser>();
  }

  async update(id: string, data: UpdateUserDto): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true }).lean<IUser>();
  }

  async updateRole(id: string, data: UpdateRoleDto): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: { role: data.role } }, { new: true }).lean<IUser>();
  }

  async delete(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  }
}
